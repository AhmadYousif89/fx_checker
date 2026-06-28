import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useActivePair() {
  const { from = 'USD', to = 'EUR', amount = '1' } = useSearch({ from: '/' })

  return {
    sender: from,
    receiver: to,
    amount: amount,
  }
}

export function useSetActivePair() {
  const navigate = useNavigate()

  const set = useCallback(
    (updates: { from?: string; to?: string; amount?: string }) => {
      navigate({
        to: '/',
        search: (prev) => ({ ...prev, ...updates }),
      })
    },
    [navigate],
  )

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

  return { updateUrl: set, swap }
}
