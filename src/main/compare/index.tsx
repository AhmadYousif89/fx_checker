import { memo, useMemo } from 'react'
import { Image } from '@unpic/react'
import { StarIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
import {
  toggleFavorite,
  useCurrencyStore,
  useIsFavorited,
} from '#/store/currencies.store'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useActivePair } from '#/hooks/use-active-pair'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { useCurrenciesQuery } from '#/hooks/use-currencies'
import {
  getCrossRate,
  formatAmount,
  formatRate,
  getFlagUrl,
  abbreviateCurrencyName,
  orderCompareCurrencies,
} from '#/lib/currency'

export const CompareSection = () => {
  const { currencies } = useCurrenciesQuery()
  const recent = useCurrencyStore.getState().recent
  const favorites = useCurrencyStore((s) => s.favorites)
  const { sender, receiver, amount: urlAmount } = useActivePair()
  const { data: ratesData, isLoading, isError } = useLatestRates()

  const amount = parseFloat(urlAmount.replace(/,/g, '') || '0')

  // Build a code → name map
  const codeToName = useMemo(() => {
    return new Map(currencies.map((c) => [c.iso_code, c.name]))
  }, [currencies])

  // Track which currencies are available in the current rates data
  const availableCodes = useMemo(() => {
    if (!ratesData) return new Set<string>()
    return new Set([...Object.keys(ratesData.rates), 'EUR'])
  }, [ratesData])

  const comparePairs = useMemo(
    () =>
      orderCompareCurrencies({
        sender,
        receiver,
        favorites,
        recent,
        availableCodes,
      }),
    [sender, receiver, favorites, recent, availableCodes],
  )

  const rates = ratesData?.rates

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
        <div className="flex items-center justify-between">
          <div className="h-5 w-48 rounded bg-muted/30 animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted/30 animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-10 animate-pulse bg-muted/10"
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !ratesData) {
    return (
      <p className="text-caption text-red text-center py-8">
        Failed to load rates
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-4 md:gap-5 bg-surface border border-surface-600 rounded-16 p-4 md:p-5">
      <header className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
        <h3 className="uppercase">
          <span className="text-body text-muted">multi-currency </span>
          <span className="text-body-lg-medium text-foreground">
            {formatAmount(amount, 0)} from {sender}
          </span>
        </h3>
        <p className="text-caption text-foreground-darker uppercase">
          {comparePairs.length} pairs
        </p>
      </header>

      <ul className="space-y-3">
        {comparePairs.map((quote, index) => (
          <CompareRow
            key={quote}
            quote={quote}
            sender={sender}
            amount={amount}
            rates={rates}
            name={codeToName.get(quote) ?? quote}
            index={index}
          />
        ))}
      </ul>
    </div>
  )
}

type CompareRowProps = {
  sender: string
  quote: string
  amount: number
  rates: Map<string, number> | undefined
  name: string
  index: number
}

const CompareRow = memo((props: CompareRowProps) => {
  const { sender, quote, amount, rates, name, index } = props
  const updateUrl = useUpdateUrl()
  const isFavorited = useIsFavorited(sender, quote)

  if (!rates) return null
  const rate = getCrossRate({ rates, base: sender, quote })

  if (rate == null) return null

  const converted = amount * rate
  const flagUrl = getFlagUrl(quote)

  return (
    <li
      onClick={() => updateUrl({ from: sender, to: quote })}
      style={{ animationDelay: `${index * 80}ms` }}
      className="h-15 flex items-center justify-between gap-5 bg-surface-600 border py-2.5 px-3 md:px-4 rounded-10 cursor-pointer hover:border-surface-300 active:border-surface-300 transition-colors opacity-0 animate-fade-in"
    >
      <div className="flex items-center gap-2.5 size-full md:gap-5">
        {flagUrl && (
          <Image
            src={flagUrl}
            alt={quote}
            layout="fixed"
            width={24}
            height={24}
            className="size-6 rounded-full"
          />
        )}
        <span className="flex flex-col">
          <span className="text-body">{quote}</span>
          <span className="md:hidden text-caption text-muted">
            {abbreviateCurrencyName(name)}
          </span>
          <span className="hidden md:inline text-caption text-muted">
            {name}
          </span>
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className="flex flex-col items-end gap-1.5">
          <span className="text-body-lg">{formatAmount(converted)}</span>
          <span className="text-overline text-muted">@ {formatRate(rate)}</span>
        </div>
        <Button
          size="icon-sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(sender, quote)
          }}
          className="hover:bg-surface-500 active:bg-surface-500"
        >
          <StarIcon
            className={isFavorited ? 'fill-lime stroke-lime' : 'stroke-muted'}
          />
        </Button>
      </div>
    </li>
  )
})
