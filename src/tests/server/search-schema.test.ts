import { describe, expect, it } from 'vitest'
import { searchSchema } from '#/lib/search'

describe('searchSchema', () => {
  it('preserves swapped currency codes', () => {
    expect(searchSchema.parse({ from: 'jpy', to: 'gbp' })).toEqual({
      from: 'JPY',
      to: 'GBP',
    })
  })

  it('falls back to defaults for invalid currency codes', () => {
    expect(searchSchema.parse({ from: 'three', to: '' })).toEqual({
      from: 'USD',
      to: 'EUR',
    })
  })

  it('handles null values gracefully', () => {
    const result = searchSchema.parse({ from: null, to: null })
    expect(result.from).toBeUndefined()
    expect(result.to).toBeUndefined()
  })

  it('provides amount when explicitly set', () => {
    expect(searchSchema.parse({ amount: '500' })).toEqual({
      amount: '500',
    })
  })

  it('handles empty amount with default', () => {
    expect(searchSchema.parse({ amount: '' })).toEqual({
      amount: '1',
    })
  })

  it('handles null amount as absent', () => {
    expect(searchSchema.parse({ amount: null }).amount).toBeUndefined()
  })
})
