import type { CurrencyPair } from '#/types/currency'

import { GLOBAL_PRIORITY } from './lists'

export function orderCompareCurrencies(params: {
  sender: string
  receiver: string
  favorites: CurrencyPair[]
  recent: { from: string[]; to: string[] }
  availableCodes: Set<string>
}): string[] {
  const { sender, receiver, favorites, recent, availableCodes } = params
  const seen = new Set<string>()
  const ordered: string[] = []

  const add = (code: string) => {
    if (!seen.has(code)) {
      seen.add(code)
      ordered.push(code)
    }
  }

  for (const fav of favorites) {
    add(fav.sender)
    add(fav.receiver)
  }

  for (const code of [...recent.from, ...recent.to]) add(code)

  for (const code of GLOBAL_PRIORITY) add(code)

  return ordered
    .filter((c) => c !== sender && c !== receiver && availableCodes.has(c))
    .slice(0, 8)
}
