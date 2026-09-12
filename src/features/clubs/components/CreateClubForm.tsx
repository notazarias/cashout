import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClubSchema } from '../schemas'
import type { CreateClubInput } from '../types'

type FormInput = z.input<typeof createClubSchema>
type FormOutput = z.output<typeof createClubSchema>

export function CreateClubForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (input: CreateClubInput) => Promise<void>
  onCancel: () => void
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createClubSchema),
    defaultValues: { name: '' },
  })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ name: values.name }))} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block font-sans text-xs text-paper/60">Club Name</label>
        <Input type="text" placeholder="e.g. Thursday Night Game" {...register('name')} />
        {errors.name && <p className="mt-1 text-xs text-loss">{errors.name.message}</p>}
      </div>
      <p className="font-sans text-xs text-paper/40">
        You'll get a join code to share. It doesn't expire — set the club up once and every table you
        host under it belongs to the group.
      </p>
      <div className="mt-2 flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          Create Club
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
