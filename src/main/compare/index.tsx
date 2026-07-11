import { useEffect, useMemo } from 'react'

import { useActivePair } from '#/hooks/use-active-pair'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useCurrenciesQuery } from '#/hooks/use-currencies'
import { useCurrencyStore, seedComparePicks } from '#/store/currencies.store'
import { formatAmount, orderCompareCurrencies } from '#/lib/currency'
import { InsightCard } from '#/components/insight-card'
import { CompareItem } from './compare-item'
import { ComparePicker } from './compare-picker'

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

  const validPicks = useMemo(
    () =>
      comparePicks.filter(
        (c) => availableCodes.has(c) && c !== sender && c !== receiver,
      ),
    [comparePicks, availableCodes, sender, receiver],
  )

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
              {validPicks.length} pairs
            </span>
            <ComparePicker
              availableCodes={availableCodes}
              sender={sender}
              receiver={receiver}
              existingCodes={validPicks}
            />
          </div>
        }
      />
      <InsightCard.Body
        variants={containerVariants}
        initial={didPlay ? 'visible' : 'hidden'}
        animate="visible"
      >
        {validPicks.map((quote) => (
          <CompareItem
            key={quote}
            quote={quote}
            sender={sender}
            amount={amount}
            rates={ratesData}
            name={codeToName.get(quote) ?? quote}
          />
        ))}
      </InsightCard.Body>
    </InsightCard.Root>
  )
}
