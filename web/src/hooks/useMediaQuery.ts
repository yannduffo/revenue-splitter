'use client'

import { useSyncExternalStore } from 'react'

//same useSyncExternalStore pattern as useMounted, with a real subscription.
//server snapshot is false : no window, so we assume the narrow layout and let
//React re-render right after hydration if the viewport is actually wide.
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => false,
  )
}
