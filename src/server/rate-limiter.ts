type NowFn = () => number

export class TokenBucket {
  private tokens: number
  private lastRefill: number
  private readonly maxTokens: number
  private readonly refillInterval: number
  private readonly now: NowFn
  private _waiting = 0

  constructor(maxTokens: number, refillIntervalMs: number, now?: NowFn) {
    this.now = now ?? Date.now
    this.tokens = maxTokens
    this.lastRefill = this.now()
    this.maxTokens = maxTokens
    this.refillInterval = refillIntervalMs
  }

  tryAcquire(): boolean {
    this.refill()
    if (this.tokens < 1) return false
    this.tokens -= 1
    return true
  }

  async acquire(): Promise<void> {
    while (!this.tryAcquire()) {
      this._waiting++
      try {
        const waitMs = Math.ceil(this.refillInterval / this.maxTokens)
        await new Promise((resolve) => setTimeout(resolve, waitMs))
      } finally {
        this._waiting--
      }
    }
  }

  get isWaiting(): boolean {
    return this._waiting > 0
  }

  private refill(): void {
    const now = this.now()
    const elapsed = now - this.lastRefill
    if (elapsed <= 0) return
    const tokensToAdd = (elapsed / this.refillInterval) * this.maxTokens
    this.tokens = Math.min(this.maxTokens, this.tokens + tokensToAdd)
    this.lastRefill = now
  }

  get availableTokens(): number {
    this.refill()
    return this.tokens
  }
}

export const twelveDataBucket = new TokenBucket(8, 60_000)
