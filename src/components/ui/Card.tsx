import type { HTMLAttributes } from 'react'

export function Card({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-sm border border-sage/30 bg-felt p-6 shadow-[0_1px_0_0_rgba(232,227,216,0.06)] ${className}`}
      {...props}
    />
  )
}
