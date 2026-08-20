import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-sm border border-sage/40 bg-ink px-3 py-2 font-sans text-sm text-paper placeholder:text-sage focus:border-brass focus:outline-none ${className}`}
      {...props}
    />
  )
}
