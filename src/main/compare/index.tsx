import { useEffect, useMemo } from 'react'

import { useActivePair } from '#/hooks/use-active-pair'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useCurrenciesQuery } from '#/hooks/use-currencies'
import { useCurrencyStore, seedComparePicks } from '#/store/currencies.store'
import { formatAmount, getCrossRateLoose, orderCompareCurrencies } from '#/lib/currency'
import { InsightCard } from '#/components/insight-card'
import { CompareItem } from './compare-item'
import { ComparePicker } from './compare-picker'
import { CompareActionMenu } from './compare-actions'

let compsDidPlay = false

export const CompareSection = () => {
  const { currencies } = useCurrenciesQuery()
  const recent = useCurrencyStore((s) => s.recent)
  const favorites = useCurrencyStore((s) => s.favorites)
  const comparePicks = useCurrencyStore((s) => s.comparePicks)
  const { sender, receiver, amount: urlAmount } = useActivePair()
  const { data: ratesData, isLoading, isError, isFetching } = useLatestRates()
  const didPlay = compsDidPlay

  useEffect(() => {
    if (isLoading || isError) return
    compsDidPlay = true
  }, [isLoading, isError])

  const containerVariants = {
    visible: {
      transition: {
        staggerChildren: didPlay ? 0 : 0.08,
        default: { duration: 0.35, ease: 'easeOut' },
      },
    },
  }

  const amount = parseFloat(urlAmount.replace(/,/g, '')) || 1

  const codeToName = useMemo(() => {
    return new Map(currencies.map((c) => [c.iso_code, c.name]))
  }, [currencies])

  const availableCodes = useMemo(() => {
    if (!ratesData) return new Set<string>()
    return new Set([...ratesData.keys(), 'EUR'])
  }, [ratesData])

  const defaultPairs = useMemo(
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

  // Seed comparePicks once on first load when defaults are ready
  useEffect(() => {
    if (comparePicks.length === 0 && defaultPairs.length > 0) {
      seedComparePicks(defaultPairs)
    }
  }, [defaultPairs, comparePicks.length])

  const compareItems = useMemo(() => {
    if (!ratesData) return []
    const valid = comparePicks.filter(
      (c) => availableCodes.has(c) && c !== sender && c !== receiver,
    )
    const items: Array<{
      quote: string
      rate: number
      converted: number
      name: string
    }> = []
    for (const quote of valid) {
      const rate = getCrossRateLoose({
        rates: ratesData,
        base: sender,
        quote,
      })
      if (rate == null) continue
      items.push({
        quote,
        rate,
        converted: amount * rate,
        name: codeToName.get(quote) ?? quote,
      })
    }
    return items
  }, [comparePicks, availableCodes, sender, receiver, ratesData, amount, codeToName])

  if (isLoading || isFetching) {
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
      <InsightCard.Header className="pr-0">
        <div className="flex items-center gap-3">
          <CompareActionMenu />
          <span className="text-body-lg-medium text-foreground">
            {formatAmount(amount, 0)} from {sender}
          </span>
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4">
          <span className="text-caption uppercase text-foreground-darker">
            {compareItems.length} pairs
          </span>
          <ComparePicker
            availableCodes={availableCodes}
            sender={sender}
            receiver={receiver}
            existingCodes={compareItems.map((i) => i.quote)}
          />
        </div>
      </InsightCard.Header>
      <InsightCard.Body
        variants={containerVariants}
        initial={didPlay ? 'visible' : 'hidden'}
        animate="visible"
      >
        {compareItems.map((item) => (
          <CompareItem
            key={item.quote}
            quote={item.quote}
            sender={sender}
            rate={item.rate}
            converted={item.converted}
            name={item.name}
          />
        ))}
      </InsightCard.Body>
    </InsightCard.Root>
  )
}
