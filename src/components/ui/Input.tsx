import type { InputHTMLAttributes } from 'react'

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-sm border border-paper/20 bg-ink px-3 py-2 font-sans text-sm text-paper placeholder:text-paper/40 focus:border-amber focus:outline-none 2xl:px-4 2xl:py-3 2xl:text-base 3xl:px-5 3xl:py-4 3xl:text-lg ${className}`}
      {...props}
    />
  )
}
