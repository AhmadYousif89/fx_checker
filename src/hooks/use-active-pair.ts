import { useCallback } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

import { useLoadingStore } from '#/store/loading.store'

export function useActivePair() {
  const navigate = useNavigate()
  const setLoading = useLoadingStore((s) => s.setLoading)

  const sender = useSearch({ from: '/', select: (s) => s.from ?? 'USD' })
  const receiver = useSearch({ from: '/', select: (s) => s.to ?? 'EUR' })
  const amount = useSearch({ from: '/', select: (s) => s.amount ?? '1' })

  const swap = useCallback(() => {
    setLoading(true)
    navigate({
      to: '/',
      search: (prev) => ({
        ...prev,
        from: prev.to ?? 'EUR',
        to: prev.from ?? 'USD',
      }),
      replace: true,
    })
  }, [navigate, setLoading])

  return { sender, receiver, amount, swap }
}
