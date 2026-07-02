import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useActivePair() {
  const navigate = useNavigate()
  const sender = useSearch({ from: '/', select: (s) => s.from ?? 'USD' })
  const receiver = useSearch({ from: '/', select: (s) => s.to ?? 'EUR' })
  const amount = useSearch({ from: '/', select: (s) => s.amount ?? '1' })

  const swap = useCallback(() => {
    navigate({
      to: '/',
      search: (prev) => ({
        ...prev,
        from: receiver,
        to: sender,
      }),
    })
  }, [navigate, receiver, sender])

  return {
    sender,
    receiver,
    amount,
    swap,
  }
}
