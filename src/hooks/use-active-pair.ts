import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useActivePair() {
  const navigate = useNavigate()

  const from = useSearch({ from: '/', select: (s) => s.from ?? 'USD' })
  const to = useSearch({ from: '/', select: (s) => s.to ?? 'EUR' })
  const amount = useSearch({ from: '/', select: (s) => s.amount ?? '1' })

  const swap = useCallback(() => {
    navigate({
      to: '/',
      search: (prev) => ({
        ...prev,
        from: prev.to ?? 'EUR',
        to: prev.from ?? 'USD',
      }),
    })
  }, [navigate])

  return {
    sender: from,
    receiver: to,
    amount,
    swap,
  }
}
