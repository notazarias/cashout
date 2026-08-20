import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useAuthContext } from '../authContext'

export function GoogleOAuthButton({ migrateGuestData = false }: { migrateGuestData?: boolean }) {
  const { signInWithGoogle } = useAuthContext()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setError(null)
    setLoading(true)
    try {
      await signInWithGoogle({ migrateGuestData })
      // Supabase redirects to Google; execution effectively ends here.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start Google sign-in.')
      setLoading(false)
    }
  }

  return (
    <div>
      <Button type="button" variant="secondary" onClick={handleClick} disabled={loading} className="w-full">
        {loading ? 'Redirecting…' : 'Continue with Google'}
      </Button>
      {error && <p className="mt-2 text-sm text-brick">{error}</p>}
    </div>
  )
}
