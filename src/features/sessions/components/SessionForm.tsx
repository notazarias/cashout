import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { LogCompletedSessionInput } from '@/lib/dataAdapter/types'
import { logPastSessionSchema, todayIso } from '../schemas'

type FormInput = z.input<typeof logPastSessionSchema>
type FormOutput = z.output<typeof logPastSessionSchema>

export function SessionForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: LogCompletedSessionInput) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(logPastSessionSchema),
    defaultValues: { date: todayIso(), locationLabel: '', buyIn: 0, cashOut: 0, durationMinutes: undefined },
  })

  async function submit(values: FormOutput) {
    await onSubmit({
      date: values.date,
      locationLabel: values.locationLabel?.trim() || undefined,
      buyInCents: Math.round(values.buyIn * 100),
      cashOutCents: Math.round(values.cashOut * 100),
      durationMinutes: values.durationMinutes || undefined,
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
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-sans text-xs text-paper/60">Buy-in ($)</label>
          <Input type="number" step="0.01" min="0" {...register('buyIn')} />
          {errors.buyIn && <p className="mt-1 text-xs text-loss">{errors.buyIn.message}</p>}
        </div>
        <div>
          <label className="mb-1 block font-sans text-xs text-paper/60">Cash-out ($)</label>
          <Input type="number" step="0.01" min="0" {...register('cashOut')} />
          {errors.cashOut && <p className="mt-1 text-xs text-loss">{errors.cashOut.message}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Duration in minutes (optional)</label>
        <Input type="number" step="1" min="0" placeholder="e.g. 180" {...register('durationMinutes')} />
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Log Session
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
