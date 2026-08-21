import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-sm border border-paper/15 bg-paper-dim p-6 shadow-[0_1px_0_0_rgba(237,231,217,0.06)] ${className}`}
      {...props}
    />
  )
}
