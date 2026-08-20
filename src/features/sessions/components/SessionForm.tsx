import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import type { NewSessionInput, Session } from '@/lib/dataAdapter/types'

const schema = z.object({
  date: z.string().min(1, 'Date is required'),
  locationLabel: z.string().optional(),
  buyIn: z.coerce.number().min(0, 'Must be 0 or more'),
  cashOut: z.coerce.number().min(0, 'Must be 0 or more'),
  durationMinutes: z.coerce.number().min(0).optional(),
})

type FormInput = z.input<typeof schema>
type FormOutput = z.output<typeof schema>

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function toDefaults(session?: Session): FormInput {
  if (!session) return { date: todayIso(), locationLabel: '', buyIn: 0, cashOut: 0, durationMinutes: undefined }
  return {
    date: session.date,
    locationLabel: session.locationLabel ?? '',
    buyIn: session.buyInCents / 100,
    cashOut: session.cashOutCents / 100,
    durationMinutes: session.durationMinutes,
  }
}

export function SessionForm({
  initial,
  submitLabel = 'Log Session',
  onSubmit,
  onCancel,
}: {
  initial?: Session
  submitLabel?: string
  onSubmit: (input: NewSessionInput) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: toDefaults(initial),
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
        <label className="mb-1 block font-sans text-xs text-sage">Date</label>
        <Input type="date" {...register('date')} />
        {errors.date && <p className="mt-1 text-xs text-brick">{errors.date.message}</p>}
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-sage">Location (optional)</label>
        <Input type="text" placeholder="e.g. Home Game, Bellagio" {...register('locationLabel')} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block font-sans text-xs text-sage">Buy-in ($)</label>
          <Input type="number" step="0.01" min="0" {...register('buyIn')} />
          {errors.buyIn && <p className="mt-1 text-xs text-brick">{errors.buyIn.message}</p>}
        </div>
        <div>
          <label className="mb-1 block font-sans text-xs text-sage">Cash-out ($)</label>
          <Input type="number" step="0.01" min="0" {...register('cashOut')} />
          {errors.cashOut && <p className="mt-1 text-xs text-brick">{errors.cashOut.message}</p>}
        </div>
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-sage">Duration in minutes (optional)</label>
        <Input type="number" step="1" min="0" placeholder="e.g. 180" {...register('durationMinutes')} />
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
