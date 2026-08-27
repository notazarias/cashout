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
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3.5 text-base',
}

export function Button({ variant = 'primary', size = 'md', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xs font-sans font-medium uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
