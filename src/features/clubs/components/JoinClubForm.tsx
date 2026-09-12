import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { joinClubSchema } from '../schemas'

type FormInput = z.input<typeof joinClubSchema>
type FormOutput = z.output<typeof joinClubSchema>

export function JoinClubForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (code: string) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(joinClubSchema),
    defaultValues: { code: '' },
  })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit(values.code))} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block font-sans text-xs text-paper/60">Club Code</label>
        <Input
          type="text"
          autoCapitalize="characters"
          placeholder="6-character code"
          className="font-mono uppercase tracking-widest"
          {...register('code')}
        />
        {errors.code && <p className="mt-1 text-xs text-loss">{errors.code.message}</p>}
      </div>
      <div className="mt-2 flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Join Club
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
