import type { ReactNode } from 'react'

/** Shared by every modal in the app. `items-start sm:items-center` + `overflow-y-auto py-8` means a
 * tall form (or a phone keyboard eating half the viewport) scrolls within the overlay instead of
 * clipping top/bottom — centering only kicks in once there's room for it. */
export function ModalOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/80 px-4 py-8 sm:items-center">
      {children}
    </div>
  )
}
