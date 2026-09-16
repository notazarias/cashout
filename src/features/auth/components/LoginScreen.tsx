import { Link } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Money, Mono } from '@/components/ui/Mono'
import { Stamp } from '@/components/ui/Stamp'
import { useAuthContext } from '../authContext'
import { EmailPasswordForm } from './EmailPasswordForm'
import { GoogleOAuthButton } from './GoogleOAuthButton'

function SampleTicket({
  location,
  date,
  cents,
  variant,
}: {
  location: string
  date: string
  cents: number
  variant: 'win' | 'loss'
}) {
  return (
    <div className="flex items-center justify-between border-b border-dashed border-paper/15 py-4 last:border-0 2xl:py-5 3xl:py-6 4xl:py-7">
      <div className="text-base 2xl:text-lg 3xl:text-xl 4xl:text-2xl">
        <Mono className="text-paper">{date}</Mono>
        <span className="ml-3 font-sans text-paper/60">{location}</span>
      </div>
      <div className="flex items-center gap-4 2xl:gap-5 3xl:gap-6">
        <Stamp variant={variant} />
        <Money cents={cents} className="text-xl 2xl:text-2xl 3xl:text-3xl 4xl:text-4xl" />
      </div>
    </div>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="border-l-2 border-teal/50 pl-4 2xl:border-l-4 2xl:pl-6 3xl:pl-8">
      <h3 className="font-sans text-base font-medium text-paper 2xl:text-lg 3xl:text-2xl 4xl:text-3xl">
        {title}
      </h3>
      <p className="mt-1 font-sans text-sm text-paper/60 2xl:text-base 3xl:mt-2 3xl:text-lg 4xl:text-xl">
        {description}
      </p>
    </div>
  )
}

/** Illustrative only — CashOut is a web app today; this previews a native app that isn't built yet. */
function PhoneMockup() {
  return (
    <div className="flex flex-col items-center gap-4 2xl:gap-5 3xl:gap-6">
      <div className="w-[220px] rounded-[2.25rem] border-4 border-paper/15 bg-paper-dim p-2 shadow-2xl 3xl:w-[300px] 3xl:rounded-[2.75rem] 3xl:p-2.5 4xl:w-[360px] 4xl:rounded-[3.25rem] 4xl:p-3">
        <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.6rem] bg-ink px-4 pt-8 pb-4 3xl:rounded-[2.1rem] 3xl:px-6 3xl:pt-11 4xl:rounded-[2.5rem] 4xl:px-7 4xl:pt-13">
          <div className="absolute top-2 left-1/2 h-4 w-16 -translate-x-1/2 rounded-full bg-paper-dim 3xl:top-3 3xl:h-5 3xl:w-24 4xl:top-3.5 4xl:h-6 4xl:w-28" />
          <p className="font-serif text-lg text-paper 3xl:text-2xl 4xl:text-3xl">CashOut</p>
          <p className="mt-3 font-sans text-[9px] uppercase tracking-wide text-paper/60 3xl:mt-5 3xl:text-xs 4xl:text-sm">
            Running Total
          </p>
          <Mono className="block text-2xl font-medium text-amber 3xl:text-4xl 4xl:text-5xl">+$140.00</Mono>
          <div className="mt-5 flex flex-col gap-2.5 3xl:mt-8 3xl:gap-4 4xl:mt-10 4xl:gap-5">
            <div className="flex items-center justify-between font-sans text-[10px] text-paper/70 3xl:text-sm 4xl:text-base">
              <span>Bellagio</span>
              <Money cents={18000} className="text-[10px] 3xl:text-sm 4xl:text-base" />
            </div>
            <div className="flex items-center justify-between font-sans text-[10px] text-paper/70 3xl:text-sm 4xl:text-base">
              <span>Home Game</span>
              <Money cents={-4000} className="text-[10px] 3xl:text-sm 4xl:text-base" />
            </div>
          </div>
        </div>
      </div>
      <span className="rounded-sm bg-teal px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-widest text-ink 3xl:px-3 3xl:py-1.5 3xl:text-sm 4xl:px-4 4xl:py-2 4xl:text-base">
        iOS App · Coming Soon
      </span>
    </div>
  )
}

export function LoginScreen() {
  const { continueAsGuest } = useAuthContext()

  return (
    <div className="min-h-screen bg-ink">
      {/* Capped so an ultra-wide monitor doesn't strand the two halves at opposite edges. */}
      <div className="mx-auto grid min-h-screen max-w-[2600px] grid-cols-1 lg:grid-cols-2 2xl:grid-cols-[3fr_2fr]">
        <div className="hidden flex-col justify-center px-16 py-12 lg:flex xl:px-20 2xl:px-24 3xl:px-28 4xl:px-32">
          <h1 className="mb-4 font-serif text-7xl text-paper xl:text-8xl 2xl:text-9xl 3xl:mb-8 3xl:text-[11rem] 4xl:text-[14rem]">
            CashOut
          </h1>
          <p className="mb-12 max-w-md font-sans text-xl text-paper/60 2xl:mb-16 2xl:max-w-xl 2xl:text-2xl 3xl:mb-20 3xl:max-w-none 3xl:text-4xl 4xl:text-5xl">
            Track your sessions. Settle up with the truth.
          </p>

          <div className="flex items-start gap-8 2xl:gap-10 3xl:gap-16 4xl:gap-20">
            <div className="min-w-0 max-w-md flex-1 3xl:max-w-xl 4xl:max-w-2xl">
              <div className="mb-10 flex flex-col gap-5 2xl:mb-12 2xl:gap-7 3xl:mb-16 3xl:gap-10">
                <Feature
                  title="Track every session"
                  description="Live buy-ins, pauses, and cash-outs — or log a past session in seconds."
                />
                <Feature
                  title="Settle up automatically"
                  description="Minimum-payment math when a table closes, not a spreadsheet argument."
                />
                <Feature
                  title="Guests welcome"
                  description="Friends can join a table and cash out without creating an account."
                />
              </div>

              <div>
                <SampleTicket location="Bellagio" date="Aug 22" cents={18000} variant="win" />
                <SampleTicket location="Home Game" date="Aug 19" cents={-4000} variant="loss" />
                <div className="flex items-center justify-between py-4 font-sans text-sm text-paper/60 2xl:py-5 2xl:text-base 3xl:py-6 3xl:text-xl 4xl:text-2xl">
                  <span>Alex owes you</span>
                  <Mono className="text-paper">$65.00</Mono>
                </div>
              </div>
            </div>

            <div className="hidden flex-shrink-0 2xl:block">
              <PhoneMockup />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-sm 2xl:max-w-md 3xl:max-w-lg 4xl:max-w-xl">
            <div className="mb-8 lg:hidden">
              <h1 className="mb-1 font-serif text-4xl text-paper">CashOut</h1>
              <p className="font-sans text-sm text-paper/60">Track your sessions. Settle up with the truth.</p>
            </div>

            <Card className="mb-4 2xl:p-8 3xl:mb-6 3xl:p-10 4xl:p-12">
              <EmailPasswordForm />
              <div className="my-4 flex items-center gap-3 2xl:my-6 3xl:my-8">
                <div className="h-px flex-1 bg-paper/15" />
                <span className="font-sans text-xs text-paper/60 2xl:text-sm 3xl:text-base">or</span>
                <div className="h-px flex-1 bg-paper/15" />
              </div>
              <GoogleOAuthButton />
            </Card>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-paper/15" />
              <span className="font-sans text-xs text-paper/60 2xl:text-sm 3xl:text-base">or</span>
              <div className="h-px flex-1 bg-paper/15" />
            </div>

            <Button variant="ghost" className="mt-4 w-full 2xl:mt-6 3xl:mt-8" onClick={continueAsGuest}>
              Continue as Guest
            </Button>

            <Link
              to="/privacy"
              className="mt-6 block text-center font-sans text-xs text-paper/40 hover:text-paper/60"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
