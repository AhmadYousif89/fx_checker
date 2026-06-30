import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useUpdateUrl() {
  const navigate = useNavigate()

  return useCallback(
    (updates: {
      from?: string
      to?: string
      amount?: string
      view?: string
    }) => {
      navigate({
        to: '/',
        search: (prev) => ({ ...prev, ...updates }),
        replace: true,
      })
    },
    [navigate],
  )
}
