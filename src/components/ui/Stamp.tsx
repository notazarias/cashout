export function Stamp({ variant }: { variant: 'win' | 'loss' }) {
  const isWin = variant === 'win'
  return (
    <span
      className={`inline-block select-none border px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest ${
        isWin ? '-rotate-3 border-amber text-amber' : 'rotate-2 border-loss text-loss'
      }`}
    >
      {isWin ? 'Win' : 'Loss'}
    </span>
  )
}
