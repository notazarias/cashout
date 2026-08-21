import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { addBuyInSchema } from '../schemas'

type AddBuyInInput = z.input<typeof addBuyInSchema>
type AddBuyInOutput = z.output<typeof addBuyInSchema>

export function AddBuyInForm({
  onSubmit,
  submitLabel = '+ Add Buy-in',
}: {
  onSubmit: (amountCents: number) => Promise<void>
  submitLabel?: string
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddBuyInInput, unknown, AddBuyInOutput>({
    resolver: zodResolver(addBuyInSchema),
    defaultValues: { amount: 0 },
  })

  async function submit(values: AddBuyInOutput) {
    await onSubmit(Math.round(values.amount * 100))
    reset({ amount: 0 })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex items-start gap-2">
      <div>
        <Input type="number" step="0.01" min="0" placeholder="Amount" className="w-28" {...register('amount')} />
        {errors.amount && <p className="mt-1 text-xs text-loss">{errors.amount.message}</p>}
      </div>
      <Button type="submit" variant="secondary" disabled={isSubmitting}>
        {submitLabel}
      </Button>
    </form>
  )
}
