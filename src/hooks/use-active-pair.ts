import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useActivePair() {
  const { from = 'USD', to = 'EUR', amount = '1' } = useSearch({ from: '/' })
  const navigate = useNavigate()

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
