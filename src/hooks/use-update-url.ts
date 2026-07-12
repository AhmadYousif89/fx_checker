import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

import { useLoadingStore } from '#/store/loading.store'

type UpdateUrlOptions = {
  from?: string
  to?: string
  amount?: string
  view?: string
  tab?: string
  sma?: boolean
}

export function useUpdateUrl() {
  const navigate = useNavigate()
  const startLoading = useLoadingStore((s) => s.startLoading)

  return useCallback(
    (updates: UpdateUrlOptions) => {
      if ('from' in updates || 'to' in updates || 'view' in updates) {
        startLoading('url-update')
      }

      navigate({
        to: '/',
        search: (prev) => ({ ...prev, ...updates }),
        replace: true,
      })
    },
    [navigate, startLoading],
  )
}
