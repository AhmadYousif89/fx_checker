import { useCallback, useEffect, useMemo } from 'react'
import { AnimatePresence } from 'framer-motion'

import { useActivePair } from '#/hooks/use-active-pair'
import { useLatestRates } from '#/hooks/use-latest-rates'
import { useCurrenciesQuery } from '#/hooks/use-currencies'
import {
  useCurrencyStore,
  seedComparePicks,
  addComparePick,
  addChartPick,
  setCompareView,
} from '#/store/currencies.store'
import { toasts } from '#/lib/notifications'
import {
  formatAmount,
  getCrossRate,
  orderCompareCurrencies,
} from '#/lib/currency'
import { InsightCard } from '#/components/insight-card'
import { CompareItem } from './compare-item'
import { ComparePicker } from './compare-picker'
import { CompareActionMenu } from './compare-actions'
import { CompareChart } from './compare-chart'
import { MAX_CHART_PICKS } from './compare-chart.types'

let compsDidPlay = false

export const CompareSection = () => {
  const { currencies } = useCurrenciesQuery()
  const recent = useCurrencyStore((s) => s.conversion.recent)
  const favorites = useCurrencyStore((s) => s.favorites.pairs)
  const compareView = useCurrencyStore((s) => s.compare.view)
  const chartPicks = useCurrencyStore((s) => s.compare.chartPicks)
  const comparePicks = useCurrencyStore((s) => s.compare.tablePicks)
  const lastAddedPick = useCurrencyStore((s) => s.compare.lastAddedPick)
  const { sender, receiver, amount: urlAmount } = useActivePair()
  const { data: ratesData, isLoading, isError, isFetching } = useLatestRates()
  const didPlay = compsDidPlay

  useEffect(() => {
    if (isLoading || isError) return
    compsDidPlay = true
  }, [isLoading, isError])

  // Sync chartPicks with sender/receiver changes
  useEffect(() => {
    if (compareView !== 'chart') return
    useCurrencyStore.setState((s) => {
      let picks = s.compare.chartPicks.filter((c) => c !== sender)
      if (!picks.includes(receiver) && receiver !== sender) {
        picks = [...picks, receiver]
        if (picks.length > MAX_CHART_PICKS) {
          picks = picks.slice(-MAX_CHART_PICKS)
        }
      }
      return { compare: { ...s.compare, chartPicks: picks } }
    })
  }, [compareView, sender, receiver])

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
      comparePicks.length > 0
        ? []
        : orderCompareCurrencies({
            sender,
            recent,
            receiver,
            favorites,
            availableCodes,
          }),
    [sender, receiver, favorites, recent, availableCodes, comparePicks.length],
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
      const rate = getCrossRate({
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
  }, [
    comparePicks,
    availableCodes,
    sender,
    receiver,
    ratesData,
    amount,
    codeToName,
  ])

  const isTable = compareView === 'table'

  const pickerOnPick = useCallback(
    (code: string) => {
      const name = codeToName.get(code) ?? code
      const store = useCurrencyStore.getState()

      if (isTable) {
        if (store.compare.tablePicks.includes(code)) return
        addComparePick(code)
        toasts.push(`${name} added to compare`)
      } else {
        if (store.compare.chartPicks.includes(code)) return
        if (store.compare.chartPicks.length >= MAX_CHART_PICKS) {
          toasts.push(`Maximum ${MAX_CHART_PICKS} currencies tracked`)
          return
        }
        addChartPick(code)
        toasts.push(`${name} added to compare chart`)
      }
    },
    [isTable, codeToName],
  )
  const itemCount = isTable ? compareItems.length : chartPicks.length

  if (isLoading || (isFetching && isTable)) {
    return <InsightCard.Skeleton />
  }

  if (isError || !ratesData) {
    return (
      <p className="text-caption text-red text-center py-10">
        Something went wrong, try again later
      </p>
    )
  }

  const pickerExisting = isTable ? compareItems.map((i) => i.quote) : chartPicks
  const pickerDisabled = !isTable && chartPicks.length >= MAX_CHART_PICKS
  const pickerLabel = isTable
    ? 'Add to compare'
    : chartPicks.length >= MAX_CHART_PICKS
      ? `Max ${MAX_CHART_PICKS} tracks`
      : 'Add to chart'

  return (
    <InsightCard.Root>
      <InsightCard.Header className="px-0">
        <div className="flex items-center gap-1">
          <CompareActionMenu
            value={compareView}
            onValueChange={setCompareView}
          />
          {compareView === 'table' && (
            <p className="text-body-lg-medium text-foreground truncate">
              {formatAmount(amount, 0)}{' '}
              <span className="hidden sm:inline">from</span> {sender}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-4 pl-4">
          <span className="text-caption uppercase text-foreground-darker">
            {itemCount} {isTable ? 'pairs' : 'tracks'}
          </span>
          <ComparePicker
            availableCodes={availableCodes}
            sender={sender}
            receiver={receiver}
            existingCodes={pickerExisting}
            onPick={pickerOnPick}
            disabled={pickerDisabled}
            triggerLabel={pickerLabel}
          />
        </div>
      </InsightCard.Header>
      {isTable ? (
        <InsightCard.Body>
          <AnimatePresence mode="popLayout" initial={!didPlay}>
            {compareItems.map((item, idx) => (
              <CompareItem
                key={item.quote}
                quote={item.quote}
                sender={sender}
                rate={item.rate}
                converted={item.converted}
                name={item.name}
                staggerDelay={didPlay ? 0 : idx * 80}
                isNew={didPlay && item.quote === lastAddedPick}
              />
            ))}
          </AnimatePresence>
        </InsightCard.Body>
      ) : (
        <CompareChart
          sender={sender}
          quotes={chartPicks}
          codeToName={codeToName}
        />
      )}
    </InsightCard.Root>
  )
}
