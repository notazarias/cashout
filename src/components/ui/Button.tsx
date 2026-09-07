import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'md' | 'lg'
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-amber text-ink hover:bg-amber/90',
  secondary: 'border border-teal text-paper hover:bg-paper-dim',
  ghost: 'text-teal hover:text-paper',
}

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  md: 'px-4 py-2 text-sm 2xl:px-5 2xl:py-2.5 2xl:text-base 3xl:px-6 3xl:py-3.5 3xl:text-lg',
  lg: 'px-6 py-3.5 text-base 2xl:px-8 2xl:py-4 2xl:text-lg 3xl:px-10 3xl:py-5 3xl:text-xl',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xs font-sans font-medium uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
