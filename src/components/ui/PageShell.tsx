import type { HTMLAttributes } from 'react'

/** Shared width for single-column full-page screens (live session, table manage/settlement) — wider
 * than the old max-w-2xl card layout to match the dashboard's proportional sizing pass, but deliberately
 * narrower than the dashboard's own max-w-[1920px] shell since these screens are one column, not two. */
export function PageShell({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto flex w-full max-w-4xl flex-col gap-6 ${className}`} {...props} />
}
