import { describe, expect, it } from 'vitest'
import { searchSchema } from '#/lib/search'

describe('searchSchema', () => {
  it('preserves swapped currency codes', () => {
    expect(searchSchema.parse({ from: 'jpy', to: 'gbp' })).toEqual({
      from: 'JPY',
      to: 'GBP',
      sma: true,
    })
  })

  it('falls back to defaults for invalid currency codes', () => {
    expect(searchSchema.parse({ from: 'three', to: '' })).toEqual({
      from: 'USD',
      to: 'EUR',
      sma: true,
    })
  })

  it('handles null values gracefully', () => {
    expect(searchSchema.parse({ from: null, to: null })).toEqual({
      sma: true,
    })
  })

  it('provides amount when explicitly set', () => {
    expect(searchSchema.parse({ amount: '500' })).toEqual({
      amount: '500',
      sma: true,
    })
  })

  it('handles empty amount with default', () => {
    expect(searchSchema.parse({ amount: '' })).toEqual({
      amount: '1',
      sma: true,
    })
  })

  it('handles null amount as absent', () => {
    expect(searchSchema.parse({ amount: null })).toEqual({ sma: true })
  })
})
