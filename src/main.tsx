import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { ErrorBoundary, initSentry } from './lib/sentry'

initSentry()

function ErrorFallback() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-ink px-4 text-center">
      <p className="font-serif text-2xl text-paper">Something went wrong</p>
      <p className="font-sans text-sm text-paper/60">
        Refresh the page — if it keeps happening, your data is safe, this screen just crashed.
      </p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallback={<ErrorFallback />}>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
