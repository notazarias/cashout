import type { HTMLAttributes } from 'react'

/** Every dollar amount, stat, and join code renders through this — the signature typographic move. */
export function Mono({ className = '', ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={`font-mono ${className}`} {...props} />
}

export function Money({ cents, className = '' }: { cents: number; className?: string }) {
  const dollars = (cents / 100).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
  const colorClass = cents > 0 ? 'text-amber' : cents < 0 ? 'text-loss' : 'text-paper'
  return (
    <Mono className={`${colorClass} ${className}`}>
      {cents > 0 ? '+' : ''}
      {dollars}
    </Mono>
  )
}
