import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthContext } from '../authContext'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormValues = z.infer<typeof schema>

export function EmailPasswordForm({ migrateGuestData = false }: { migrateGuestData?: boolean }) {
  const { signInWithPassword, signUpWithPassword } = useAuthContext()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [formError, setFormError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      if (mode === 'login') {
        await signInWithPassword(values.email, values.password)
      } else {
        const { confirmationRequired } = await signUpWithPassword(values.email, values.password, {
          migrateGuestData,
        })
        if (confirmationRequired) setCheckEmail(true)
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  if (checkEmail) {
    return (
      <p className="font-sans text-sm text-paper">
        Check your email to confirm your account, then log in below.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <Input type="email" placeholder="Email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-loss">{errors.email.message}</p>}
      </div>
      <div>
        <Input
          type="password"
          placeholder="Password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          {...register('password')}
        />
        {errors.password && <p className="mt-1 text-xs text-loss">{errors.password.message}</p>}
      </div>
      {formError && <p className="text-sm text-loss">{formError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        {mode === 'login' ? 'Log In' : 'Create Account'}
      </Button>
      <button
        type="button"
        onClick={() => {
          setMode(mode === 'login' ? 'signup' : 'login')
          setFormError(null)
        }}
        className="font-sans text-xs text-paper/60 hover:text-paper"
      >
        {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
      </button>
    </form>
  )
}
