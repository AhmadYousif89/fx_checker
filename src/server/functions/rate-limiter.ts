import { createServerFn } from '@tanstack/react-start'

import { twelveDataBucket } from '../rate-limiter'

export const getRateLimiterStatus = createServerFn().handler(async () => {
  return { isWaiting: twelveDataBucket.isWaiting }
})
