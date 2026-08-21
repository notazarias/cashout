import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { CloseSessionInput } from '@/lib/dataAdapter/types'
import { closeSessionSchema } from '../schemas'

type FormInput = z.input<typeof closeSessionSchema>
type FormOutput = z.output<typeof closeSessionSchema>

export function CloseSessionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: CloseSessionInput) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(closeSessionSchema),
    defaultValues: { cashOut: 0 },
  })

  async function submit(values: FormOutput) {
    await onSubmit({ cashOutCents: Math.round(values.cashOut * 100) })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Cash-out ($)</label>
        <Input type="number" step="0.01" min="0" autoFocus {...register('cashOut')} />
        {errors.cashOut && <p className="mt-1 text-xs text-loss">{errors.cashOut.message}</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Close Session
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
