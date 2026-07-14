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
  const stopLoading = useLoadingStore((s) => s.stopLoading)

  return useCallback(
    async (updates: UpdateUrlOptions) => {
      if ('from' in updates || 'to' in updates || 'view' in updates) {
        startLoading('url-update')
      }

      try {
        await navigate({
          to: '/',
          search: (prev) => ({ ...prev, ...updates }),
          resetScroll: false,
          replace: true,
        })
      } finally {
        stopLoading('url-update')
      }
    },
    [navigate, startLoading, stopLoading],
  )
}
