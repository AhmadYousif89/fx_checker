import { describe, expect, it } from 'vitest'

import { sanitizeCurrencySearch } from '#/lib/search'

describe('sanitizeCurrencySearch', () => {
  const currencies = [
    {
      name: 'US Dollar',
      symbol: '$',
      iso_code: 'USD',
      iso_numeric: '840',
      start_date: '',
      end_date: '',
    },
    {
      name: 'Euro',
      symbol: '€',
      iso_code: 'EUR',
      iso_numeric: '978',
      start_date: '',
      end_date: '',
    },
    {
      name: 'British Pound',
      symbol: '£',
      iso_code: 'GBP',
      iso_numeric: '826',
      start_date: '',
      end_date: '',
    },
  ]

  it('keeps supported currencies and normalizes casing', () => {
    expect(
      sanitizeCurrencySearch({ from: 'gbp', to: 'usd' }, currencies),
    ).toEqual({ from: 'GBP', to: 'USD' })
  })

  it('falls back to safe defaults for unsupported currencies', () => {
    expect(
      sanitizeCurrencySearch({ from: 'XYZ', to: 'ABC' }, currencies),
    ).toEqual({ from: 'USD', to: 'EUR' })
  })

  it('prevents from and to from being equal', () => {
    expect(
      sanitizeCurrencySearch({ from: 'EUR', to: 'EUR' }, currencies),
    ).toEqual({ from: 'EUR', to: 'USD' })
  })

  it('prevents equality when one falls back to the others default', () => {
    expect(
      sanitizeCurrencySearch({ from: 'EUR', to: 'XYZ' }, currencies),
    ).toEqual({ from: 'EUR', to: 'USD' })
  })

  it('handles null and undefined gracefully', () => {
    expect(
      sanitizeCurrencySearch({ from: null, to: undefined } as any, currencies),
    ).toEqual({ from: 'USD', to: 'EUR' })
  })

  it('sets to to FALLBACK_TO when from is USD and they would be equal', () => {
    expect(
      sanitizeCurrencySearch({ from: 'USD', to: 'USD' }, currencies),
    ).toEqual({ from: 'USD', to: 'EUR' })
  })
})
