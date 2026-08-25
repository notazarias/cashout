import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { hostTableSchema } from '../schemas'
import type { HostTableInput } from '../types'

type FormInput = z.input<typeof hostTableSchema>
type FormOutput = z.output<typeof hostTableSchema>

export function HostTableForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: HostTableInput) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(hostTableSchema),
    defaultValues: { locationLabel: '', buyIn: 0, maxPlayers: undefined },
  })

  async function submit(values: FormOutput) {
    await onSubmit({
      locationLabel: values.locationLabel?.trim() || undefined,
      buyInCents: Math.round(values.buyIn * 100),
      maxPlayers: values.maxPlayers || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Location (optional)</label>
        <Input type="text" placeholder="e.g. Home Game, Bellagio" {...register('locationLabel')} />
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Suggested Buy-in ($)</label>
        <Input type="number" step="0.01" min="0" {...register('buyIn')} />
        {errors.buyIn && <p className="mt-1 text-xs text-loss">{errors.buyIn.message}</p>}
      </div>
      <div>
        <label className="mb-1 block font-sans text-xs text-paper/60">Max Players (optional)</label>
        <Input type="number" step="1" min="1" placeholder="e.g. 8" {...register('maxPlayers')} />
        {errors.maxPlayers && <p className="mt-1 text-xs text-loss">{errors.maxPlayers.message}</p>}
      </div>
      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Host Table
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
