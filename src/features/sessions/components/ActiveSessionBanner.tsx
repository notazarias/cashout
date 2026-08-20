import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Mono } from '@/components/ui/Mono'
import type { CloseSessionInput, OpenSession, StartSessionInput } from '@/lib/dataAdapter/types'
import { addBuyInSchema } from '../schemas'
import { CloseSessionForm } from './CloseSessionForm'
import { StartSessionForm } from './StartSessionForm'

type AddBuyInInput = z.input<typeof addBuyInSchema>
type AddBuyInOutput = z.output<typeof addBuyInSchema>

function formatStartedAt(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

function AddBuyInInline({ onAddBuyIn }: { onAddBuyIn: (amountCents: number) => Promise<void> }) {
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
    await onAddBuyIn(Math.round(values.amount * 100))
    reset({ amount: 0 })
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex items-start gap-2">
      <div>
        <Input type="number" step="0.01" min="0" placeholder="Amount" className="w-28" {...register('amount')} />
        {errors.amount && <p className="mt-1 text-xs text-brick">{errors.amount.message}</p>}
      </div>
      <Button type="submit" variant="secondary" disabled={isSubmitting}>
        + Add Buy-in
      </Button>
    </form>
  )
}

export function ActiveSessionBanner({
  session,
  onStart,
  onAddBuyIn,
  onCloseSession,
}: {
  session: OpenSession | null
  onStart: (input: StartSessionInput) => Promise<void>
  onAddBuyIn: (id: string, amountCents: number) => Promise<void>
  onCloseSession: (id: string, input: CloseSessionInput) => Promise<void>
}) {
  const [showStart, setShowStart] = useState(false)
  const [showClose, setShowClose] = useState(false)

  if (!session) {
    return (
      <>
        <Card className="flex items-center justify-between">
          <p className="font-sans text-sm text-sage">No session in progress.</p>
          <Button onClick={() => setShowStart(true)}>Start Session</Button>
        </Card>
        {showStart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
            <Card className="w-full max-w-sm">
              <h2 className="mb-4 font-serif text-xl font-semibold text-paper">Start a Session</h2>
              <StartSessionForm
                onSubmit={async (input) => {
                  await onStart(input)
                  setShowStart(false)
                }}
                onCancel={() => setShowStart(false)}
              />
            </Card>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Card className="border-brass/60">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="rounded-sm bg-brass px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink">
              LIVE
            </span>
            <span className="font-serif text-lg font-semibold text-paper">
              {session.locationLabel || 'Session in progress'}
            </span>
          </div>
          <Button variant="secondary" onClick={() => setShowClose(true)}>
            Close Session
          </Button>
        </div>
        <div className="mb-4 flex items-baseline gap-4 font-sans text-sm text-sage">
          <span>
            Buy-in total <Mono className="text-paper">${(session.buyInCents / 100).toFixed(2)}</Mono>
          </span>
          {session.startedAt && (
            <span>
              Started <Mono className="text-paper">{formatStartedAt(session.startedAt)}</Mono>
            </span>
          )}
        </div>
        <AddBuyInInline onAddBuyIn={(amountCents) => onAddBuyIn(session.id, amountCents)} />
      </Card>

      {showClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 px-4">
          <Card className="w-full max-w-sm">
            <h2 className="mb-4 font-serif text-xl font-semibold text-paper">Close Session</h2>
            <CloseSessionForm
              onSubmit={async (input) => {
                await onCloseSession(session.id, input)
                setShowClose(false)
              }}
              onCancel={() => setShowClose(false)}
            />
          </Card>
        </div>
      )}
    </>
  )
}
