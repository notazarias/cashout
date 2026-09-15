# Account deletion

CashOut has no self-service "delete my account" button yet. If a user (friend, tester, anyone)
asks for their data to be deleted, run this manually against the **production** Supabase project
via the SQL editor (or `execute_sql`). It has been tested end-to-end against a live project.

## Before you run anything

Identify the target account and **run this against production**, not dev:

```sql
select id, email, created_at from auth.users where email = '<their email>';
```

Copy the `id` — every step below is safer keyed off the id than re-typing the email each time.

## Why this isn't a single `DELETE FROM auth.users`

Most tables cascade automatically when the `auth.users` row is deleted (`profiles`, `sessions`,
`session_activity`, and `tables` they host all have `ON DELETE CASCADE` back to `auth.users`).
But several relationships deliberately do **not** cascade, and get this wrong and the final delete
fails with a foreign-key violation, or silently orphans someone else's data:

- **`clubs.owner_id`, `club_members.user_id`, `settlements.from_user`/`to_user`** — no cascade at
  all. A deleted user's club/settlement rows must be removed explicitly first.
- **`sessions.table_id`, `settlements.table_id`** — no cascade. If the target user *hosts* a table
  that other people played at, their sessions/settlements still reference that table. Deleting the
  user would cascade-delete the table (`tables.host_id` does cascade) while those other rows still
  point at it — blocked.
- **`tables.club_id`, `club_members.club_id`** — no cascade. If the target user *owns* a club that
  other people belong to, or that has tables (possibly hosted by someone else) attached to it,
  deleting the club needs those handled first. Tables attached to the club get **detached**
  (`club_id` set to null), not deleted — the table and its game history belong to whoever hosted
  it, not to the club.

## The script

Replace `<user_id>` (five places) with the id from the lookup above, and run top to bottom.

```sql
-- 1. Tables this user hosts: clear other players' references before the table itself
--    disappears via the auth.users cascade.
delete from public.settlements
  where table_id in (select id from public.tables where host_id = '<user_id>');

delete from public.sessions
  where table_id in (select id from public.tables where host_id = '<user_id>');
  -- session_activity for these cascades automatically (session_activity.session_id -> sessions ON DELETE CASCADE)

-- 2. Settlements naming this user as payer/payee at tables they don't host.
delete from public.settlements where from_user = '<user_id>' or to_user = '<user_id>';

-- 3. Clubs this user owns: detach any tables (possibly hosted by someone else) and
--    remove every member row before the club itself can be deleted.
update public.tables set club_id = null
  where club_id in (select id from public.clubs where owner_id = '<user_id>');

delete from public.club_members
  where club_id in (select id from public.clubs where owner_id = '<user_id>');

delete from public.clubs where owner_id = '<user_id>';

-- 4. Membership in clubs this user doesn't own.
delete from public.club_members where user_id = '<user_id>';

-- 5. The account itself. Cascades to: profiles, this user's own sessions (+ their
--    session_activity), and tables they host (now safe — step 1 cleared the blockers).
delete from auth.identities where user_id = '<user_id>';
delete from auth.users where id = '<user_id>';
```

## Verify it actually happened

```sql
select
  (select count(*) from auth.users where id = '<user_id>') as users,
  (select count(*) from public.profiles where id = '<user_id>') as profiles,
  (select count(*) from public.sessions where user_id = '<user_id>') as sessions,
  (select count(*) from public.tables where host_id = '<user_id>') as tables_hosted,
  (select count(*) from public.clubs where owner_id = '<user_id>') as clubs_owned,
  (select count(*) from public.club_members where user_id = '<user_id>') as club_memberships,
  (select count(*) from public.settlements where from_user = '<user_id>' or to_user = '<user_id>') as settlements;
```

Every column should read `0`.

## What this does *not* do

- **Other people's data stays intact.** A tablemate's own session/settlement rows are untouched —
  only the requesting user's identity and the rows that are exclusively theirs are removed. A
  table they hosted is gone (game history included); a table someone else hosted that they merely
  played at is not.
- **Guest (anonymous) sessions** aren't covered by this — a guest never created a permanent
  `auth.users` row tied to an email in the first place, so there's no durable account to delete;
  their data already lives only in that browser's localStorage or a temporary anonymous identity.
