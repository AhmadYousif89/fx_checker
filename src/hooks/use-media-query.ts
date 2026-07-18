import { useSyncExternalStore } from 'react'

function getServerSnapshot() {
  return false
}

export function useMediaQuery(query: string) {
  function subscribe(callback: () => void) {
    if (typeof window.matchMedia !== 'function') return () => {}
    const mql = window.matchMedia(query)
    mql.addEventListener('change', callback)
    return () => mql.removeEventListener('change', callback)
  }

  function getSnapshot() {
    if (typeof window.matchMedia !== 'function') return false
    return window.matchMedia(query).matches
  }

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
