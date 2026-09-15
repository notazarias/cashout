import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useAuthContext } from '../authContext'

const schema = z.object({ password: z.string().min(6, 'Password must be at least 6 characters') })
type FormValues = z.infer<typeof schema>

/** Reached via the link in a reset-password email. supabase-js's detectSessionInUrl already turns
 * that link into a valid (recovery) session before this ever mounts — same mechanism AuthCallback
 * relies on for OAuth — so submitting here just needs to call updateUser, no token handling. */
export function ResetPasswordScreen() {
  const { updatePassword } = useAuthContext()
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    setFormError(null)
    try {
      await updatePassword(values.password)
      setDone(true)
    } catch {
      // Virtually every failure here reduces to "no valid recovery session" (link expired,
      // already used, or opened directly) — Supabase's raw message ("Auth session missing!")
      // isn't actionable for the user, so always show the one explanation that actually is.
      setFormError('Could not reset your password — the link may have expired. Request a new one.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <Card className="w-full max-w-sm">
        <h1 className="mb-4 font-serif text-xl text-paper">Reset Password</h1>
        {done ? (
          <div className="flex flex-col gap-3">
            <p className="font-sans text-sm text-paper">Your password has been updated.</p>
            <Button onClick={() => navigate('/app')}>Continue to Dashboard</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            <div>
              <Input
                type="password"
                placeholder="New password"
                autoComplete="new-password"
                autoFocus
                {...register('password')}
              />
              {errors.password && <p className="mt-1 text-xs text-loss">{errors.password.message}</p>}
            </div>
            {formError && <p className="text-sm text-loss">{formError}</p>}
            <Button type="submit" disabled={isSubmitting}>
              Set New Password
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
