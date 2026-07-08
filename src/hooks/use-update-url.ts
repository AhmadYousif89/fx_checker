import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { useLoadingStore } from '#/store/loading.store'

export function useUpdateUrl() {
  const navigate = useNavigate()
  const setLoading = useLoadingStore((s) => s.setLoading)

  return useCallback(
    (updates: {
      from?: string
      to?: string
      amount?: string
      view?: string
      tab?: string
    }) => {
      if ('from' in updates || 'to' in updates) {
        setLoading({ isLoading: true })
      }

      navigate({
        to: '/',
        search: (prev) => ({ ...prev, ...updates }),
        replace: true,
      })
    },
    [navigate, setLoading],
  )
}
