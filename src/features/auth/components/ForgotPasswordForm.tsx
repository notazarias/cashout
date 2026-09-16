import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { reportError } from '@/lib/sentry'
import { useAuthContext } from '../authContext'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormValues = z.infer<typeof schema>

export function ForgotPasswordForm({ onDone }: { onDone: () => void }) {
  const { resetPasswordForEmail } = useAuthContext()
  const [sent, setSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await resetPasswordForEmail(values.email)
      setSent(true)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong.')
      reportError(err, 'request password reset')
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-3">
        <p className="font-sans text-sm text-paper">
          If an account exists for that email, a reset link is on its way. Check your inbox.
        </p>
        <button type="button" onClick={onDone} className="self-start font-sans text-xs text-paper/60 hover:text-paper">
          ← Back to log in
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <p className="font-sans text-sm text-paper/60">
        Enter your email and we'll send you a link to reset your password.
      </p>
      <div>
        <Input type="email" placeholder="Email" autoComplete="email" {...register('email')} />
        {errors.email && <p className="mt-1 text-xs text-loss">{errors.email.message}</p>}
      </div>
      {formError && <p className="text-sm text-loss">{formError}</p>}
      <Button type="submit" disabled={isSubmitting}>
        Send Reset Link
      </Button>
      <button type="button" onClick={onDone} className="self-start font-sans text-xs text-paper/60 hover:text-paper">
        ← Back to log in
      </button>
    </form>
  )
}
