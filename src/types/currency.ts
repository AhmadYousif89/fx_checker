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

export type ApiRate = {
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
  rate: number
  result: number
  timestamp: number
}
