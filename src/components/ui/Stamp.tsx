export function Stamp({ variant }: { variant: 'win' | 'loss' }) {
  const isWin = variant === 'win'
  return (
    <span
      className={`inline-block select-none border-2 px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-widest ${
        isWin ? '-rotate-3 border-amber text-amber' : 'rotate-2 border-loss text-loss'
      }`}
    >
      {isWin ? 'Win' : 'Loss'}
    </span>
  )
}
