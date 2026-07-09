import { useMemo } from 'react'

import { useActivePair } from '#/hooks/use-active-pair'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useCurrenciesQuery } from '#/hooks/use-currencies'
import { useCurrencyStore } from '#/store/currencies.store'
import { formatAmount, orderCompareCurrencies } from '#/lib/currency'
import { InsightCard } from '#/components/insight-card'
import { CompareItem } from './compare-item'
import { ComparePicker } from './compare-picker'

export const CompareSection = () => {
  const { currencies } = useCurrenciesQuery()
  const recent = useCurrencyStore((s) => s.recent)
  const favorites = useCurrencyStore((s) => s.favorites)
  const { sender, receiver, amount: urlAmount } = useActivePair()
  const { data: ratesData, isLoading, isError } = useLatestRates()

  const amount = parseFloat(urlAmount.replace(/,/g, '')) || 1

  const codeToName = useMemo(() => {
    return new Map(currencies.map((c) => [c.iso_code, c.name]))
  }, [currencies])

  const availableCodes = useMemo(() => {
    if (!ratesData) return new Set<string>()
    return new Set([...ratesData.rates.keys(), 'EUR'])
  }, [ratesData])

  const comparePairs = useMemo(
    () =>
      orderCompareCurrencies({
        sender,
        recent,
        receiver,
        favorites,
        availableCodes,
      }),
    [sender, receiver, favorites, recent, availableCodes],
  )

  const rates = ratesData?.rates

  if (isLoading) {
    return <InsightCard.Skeleton />
  }

  if (isError || !ratesData) {
    return (
      <p className="text-caption text-red text-center py-10">
        Something went wrong, try again later
      </p>
    )
  }

  return (
    <InsightCard.Root>
      <InsightCard.Header
        title={
          <>
            <span className="text-body text-muted">multi-currency </span>
            <span className="text-body-lg-medium text-foreground">
              {formatAmount(amount, 0)} from {sender}
            </span>
          </>
        }
        headerChildren={
          <div className="flex items-center justify-between gap-2 md:gap-4 w-full">
            <span className="text-caption uppercase text-foreground-darker">
              {comparePairs.length} pairs
            </span>
            <ComparePicker />
          </div>
        }
      />
      <InsightCard.Body>
        {comparePairs.map((quote, index) => (
          <CompareItem
            key={quote}
            quote={quote}
            sender={sender}
            amount={amount}
            rates={rates}
            name={codeToName.get(quote) ?? quote}
            index={index}
          />
        ))}
      </InsightCard.Body>
    </InsightCard.Root>
  )
}
