import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-sm border border-paper/20 bg-ink px-3 py-2 font-sans text-sm text-paper placeholder:text-paper/40 focus:border-amber focus:outline-none ${className}`}
      {...props}
    />
  )
}
