import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="font-serif text-xl text-paper">{title}</h2>
      <div className="flex flex-col gap-2 font-sans text-sm text-paper/70">{children}</div>
    </div>
  )
}

/** No auth required — reachable from a logged-out or logged-in state alike. */
export function PrivacyScreen() {
  return (
    <div className="min-h-screen bg-ink px-6 py-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <div>
          <h1 className="font-serif text-3xl text-paper">Privacy</h1>
          <p className="mt-2 font-sans text-sm text-paper/60">
            Plain language, not a legal document. This app is built and run by one person for a small
            group of friends — here's exactly what it does and doesn't do with your data.
          </p>
        </div>

        <Card className="flex flex-col gap-8">
          <Section title="What's stored">
            <p>If you create an account: your email address, and whatever you enter — buy-ins, cash-outs, locations, dates, table and club names, and a display name if you set one.</p>
            <p>
              If you join a table or club, other members of that same table or club can see the parts
              of your data relevant to it (your buy-in/cash-out at that table, who owes whom in a
              settlement, your name in a shared member list). Nobody outside a table or club you're
              actually in can see your data — access is enforced at the database level, not just hidden
              in the interface.
            </p>
            <p>
              If you use Guest mode, nothing is sent anywhere by default — your sessions live only in
              your browser's local storage. The one exception: joining someone else's table as a guest
              creates a temporary, anonymous identity (no email, no permanent account) so the host and
              your tablemates can see your buy-ins and cash-out at that specific table, the same as any
              other player would.
            </p>
          </Section>

          <Section title="Who else sees it">
            <p>
              <strong className="text-paper">Supabase</strong> hosts the database and handles sign-in —
              your data lives on their infrastructure, governed by{' '}
              <a
                href="https://supabase.com/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-amber underline underline-offset-2"
              >
                their privacy policy
              </a>
              .
            </p>
            <p>
              <strong className="text-paper">Google</strong> is only involved if you choose "Continue
              with Google" to sign in — CashOut never sees your Google password.
            </p>
            <p>
              <strong className="text-paper">Sentry</strong> receives automatic reports when something
              breaks (an error message and technical context, so it can be fixed) — not your session or
              financial data.
            </p>
          </Section>

          <Section title="What this app does not do">
            <p>No payment processing. CashOut doesn't move money, connect to a bank, or handle real
              transactions — it only tracks who owes what and whether it's been marked paid, based on
              what actually happened between you and your friends in person.</p>
            <p>No selling or sharing data with third parties for advertising, marketing, or any other
              purpose. No ad trackers, no analytics trackers, no cookies beyond what's needed to keep
              you signed in.</p>
          </Section>

          <Section title="Deleting your data">
            <p>
              There's no self-service delete button yet. Ask whoever you know that's running this app
              to remove your account and it'll be done directly in the database — for real, not just
              hidden.
            </p>
          </Section>
        </Card>

        <Link to="/" className="font-sans text-sm text-teal hover:text-paper">
          ← Back
        </Link>
      </div>
    </div>
  )
}
