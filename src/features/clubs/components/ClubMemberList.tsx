import type { ClubMember } from '../types'

export function ClubMemberList({ members, currentUserId }: { members: ClubMember[]; currentUserId: string }) {
  if (members.length === 0) {
    return <p className="font-sans text-sm text-paper/60">No members yet.</p>
  }

  return (
    <ul className="divide-y divide-paper/10">
      {members.map((member) => (
        <li key={member.userId} className="flex items-center justify-between gap-3 py-3">
          <span className="font-sans text-sm text-paper">
            {member.displayName?.trim() || 'Unknown player'}
            {member.userId === currentUserId && <span className="text-paper/40"> · you</span>}
          </span>
          {member.role === 'owner' && (
            <span className="rounded-sm bg-paper-dim px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-paper/60">
              Owner
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
