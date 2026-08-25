import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { todayIso } from '@/features/sessions/schemas'
import { joinTableSchema } from '../schemas'
import type { JoinTableInput } from '../types'

type FormInput = z.input<typeof joinTableSchema>
type FormOutput = z.output<typeof joinTableSchema>

export function JoinTableForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: JoinTableInput) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(joinTableSchema),
    defaultValues: { code: '', date: todayIso(), locationLabel: '', buyIn: 0 },
  })

  async function submit(values: FormOutput) {
    await onSubmit({
      code: values.code,
      date: values.date,
      locationLabel: values.locationLabel?.trim() || undefined,
      buyInCents: Math.round(values.buyIn * 100),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Table Code</label>
        <Input type="text" placeholder="e.g. AB3XQ9" className="uppercase" {...register('code')} />
        {errors.code && <p className="mt-1 text-xs text-loss">{errors.code.message}</p>}
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Buy-in ($)</label>
        <Input type="number" step="0.01" min="0" {...register('buyIn')} />
        {errors.buyIn && <p className="mt-1 text-xs text-loss">{errors.buyIn.message}</p>}
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Location (optional)</label>
        <Input type="text" placeholder="Defaults to the table's location" {...register('locationLabel')} />
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Join Table
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
