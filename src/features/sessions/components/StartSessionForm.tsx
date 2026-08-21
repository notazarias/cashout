import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { StartSessionInput } from '@/lib/dataAdapter/types'
import { startSessionSchema, todayIso } from '../schemas'

type FormInput = z.input<typeof startSessionSchema>
type FormOutput = z.output<typeof startSessionSchema>

export function StartSessionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: StartSessionInput) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(startSessionSchema),
    defaultValues: { date: todayIso(), locationLabel: '', buyIn: 0 },
  })

  async function submit(values: FormOutput) {
    await onSubmit({
      date: values.date,
      locationLabel: values.locationLabel?.trim() || undefined,
      buyInCents: Math.round(values.buyIn * 100),
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Date</label>
        <Input type="date" {...register('date')} />
        {errors.date && <p className="mt-1 text-xs text-loss">{errors.date.message}</p>}
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Location (optional)</label>
        <Input type="text" placeholder="e.g. Home Game, Bellagio" {...register('locationLabel')} />
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Starting Buy-in ($)</label>
        <Input type="number" step="0.01" min="0" {...register('buyIn')} />
        {errors.buyIn && <p className="mt-1 text-xs text-loss">{errors.buyIn.message}</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Start Session
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
