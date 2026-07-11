export type CurrencySearch = {
  from?: string
  to?: string
  tab?: string
}

export type CurrencyPair = {
  sender: string
  receiver: string
}

export type CurrencyDetails = {
  name: string
  symbol: string
  iso_code: string
  iso_numeric: string
  start_date: string
  end_date: string
}

export type RateWithDiff = {
  base: string
  quote: string
  rate: number
  difference: number
  direction: 'up' | 'down' | 'flat'
}

export type FrankfurterApiRate = {
  date: string
  base: string
  quote: string
  rate: number
}

export type FavoritePair = {
  sender: string
  receiver: string
  rate: number
  difference: number
  direction: 'up' | 'down' | 'flat'
}

export type ConversionLog = {
  sender: string
  receiver: string
  amount: number
  baseRate: number
  result: number
  timestamp: number
}

export type LatestRatesEntry = {
  rate: number
  date: string
}

export type TwelveDataApiRate = {
  meta: {
    symbol: string
    interval: string
    currency_base: string
    currency_quote: string
    type: string
  }
  values: Array<{
    datetime: string
    open: string
    high: string
    low: string
    close: string
  }>
  status: string
}
