import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { useLoadingStore } from '#/store/loading.store'

export function useActivePair() {
  const navigate = useNavigate()
  const startLoading = useLoadingStore((s) => s.startLoading)
  const stopLoading = useLoadingStore((s) => s.stopLoading)
  const isSwapping = useLoadingStore((s) => 'swap' in s.loaders)

  const sender = useSearch({ from: '/', select: (s) => s.from ?? 'USD' })
  const receiver = useSearch({ from: '/', select: (s) => s.to ?? 'EUR' })
  const amount = useSearch({ from: '/', select: (s) => s.amount ?? '1' })

  const swap = useCallback(async () => {
    if (isSwapping) return
    startLoading('swap')
    try {
      await navigate({
        to: '/',
        search: (prev) => ({
          ...prev,
          from: prev.to ?? 'EUR',
          to: prev.from ?? 'USD',
        }),
        replace: true,
      })
    } finally {
      stopLoading('swap')
    }
  }, [navigate, startLoading, stopLoading, isSwapping])

  return { sender, receiver, amount, swap }
}
