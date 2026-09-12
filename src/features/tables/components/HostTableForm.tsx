import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useMyClubs } from '@/features/clubs/useMyClubs'
import { hostTableSchema } from '../schemas'
import type { HostTableInput } from '../types'

/** No Select primitive exists in components/ui, and one <select> doesn't justify inventing one —
 * this borrows Input's class string so the control matches the fields around it. */
const selectClasses =
  'w-full rounded-sm border border-paper/20 bg-ink px-3 py-2 font-sans text-sm text-paper focus:border-amber focus:outline-none 2xl:px-4 2xl:py-3 2xl:text-base 3xl:px-5 3xl:py-4 3xl:text-lg'

type FormInput = z.input<typeof hostTableSchema>
type FormOutput = z.output<typeof hostTableSchema>

export function HostTableForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: HostTableInput) => Promise<void>
  onCancel: () => void
}) {
  const { clubs } = useMyClubs()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(hostTableSchema),
    defaultValues: { locationLabel: '', buyIn: 0, maxPlayers: undefined, clubId: '' },
  })

  async function submit(values: FormOutput) {
    await onSubmit({
      locationLabel: values.locationLabel?.trim() || undefined,
      buyInCents: Math.round(values.buyIn * 100),
      maxPlayers: values.maxPlayers || undefined,
      clubId: values.clubId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block font-sans text-xs text-paper/60">Location (optional)</label>
        <Input type="text" placeholder="e.g. Home Game, Bellagio" {...register('locationLabel')} />
      </div>
      <div>
        <label className="mb-1.5 block font-sans text-xs text-paper/60">Suggested Buy-in ($)</label>
        <Input type="number" step="0.01" min="0" {...register('buyIn')} />
        {errors.buyIn && <p className="mt-1 text-xs text-loss">{errors.buyIn.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block font-sans text-xs text-paper/60">Max Players (optional)</label>
        <Input type="number" step="1" min="1" placeholder="e.g. 8" {...register('maxPlayers')} />
        {errors.maxPlayers && <p className="mt-1 text-xs text-loss">{errors.maxPlayers.message}</p>}
      </div>
      {clubs.length > 0 && (
        <div>
          <label className="mb-1.5 block font-sans text-xs text-paper/60">Club</label>
          <select className={selectClasses} {...register('clubId')}>
            <option value="">One-off table (no club)</option>
            {clubs.map((club) => (
              <option key={club.id} value={club.id}>
                {club.name}
              </option>
            ))}
          </select>
          <p className="mt-1 font-sans text-xs text-paper/40">
            Club members can see and join this table without a code.
          </p>
        </div>
      )}
      <div className="mt-2 flex gap-3">
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
