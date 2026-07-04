import { useMemo } from 'react'
import { Image } from '@unpic/react'
import { useSearch } from '@tanstack/react-router'
import { EarthIcon, HistoryIcon, Search, TrendingUpIcon } from 'lucide-react'

import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
} from './ui/combobox'
import { Button } from './ui/button'
import { useCurrenciesQuery } from '#/hooks/use-currencies'

import {
  POPULAR_CODES,
  parseCurrency,
  getFlagUrl,
  abbreviateCurrencyName,
} from '#/lib/currency'
import { ArrowDropDown } from './icons/arrow-drop-down'
import {
  useCurrencyStore,
  pushToRecent,
  setActivePicker,
} from '#/store/currencies.store'
import { useUpdateUrl } from '#/hooks/use-update-url'

type CurrencyPickerProps = {
  isSender?: boolean
}

export const CurrencyPicker = ({ isSender = false }: CurrencyPickerProps) => {
  const updateUrl = useUpdateUrl()
  const { from = 'USD', to = 'EUR' } = useSearch({ from: '/' })
  const selectedValue = isSender ? from : to
  const oppositeValue = isSender ? to : from
  const recent = useCurrencyStore((s) =>
    isSender ? s.recent.from : s.recent.to,
  )
  const activePicker = useCurrencyStore((s) => s.activePicker)
  const isActive = isSender
    ? activePicker === 'sender'
    : activePicker === 'receiver'

  const currenciesQuery = useCurrenciesQuery()

  const codeToName = useMemo(() => {
    if (!currenciesQuery.currencies.length) return new Map<string, string>()
    return new Map(currenciesQuery.currencies.map((c) => [c.iso_code, c.name]))
  }, [currenciesQuery.currencies])

  const groups = useMemo(() => {
    if (!currenciesQuery.currencies.length) return []

    const excludeOpposite = (item: string) =>
      !item.startsWith(`${oppositeValue}-`)

    const recentItems = recent
      .filter((code) => codeToName.has(code))
      .map((code) => `${code}-${codeToName.get(code)}`)
      .filter(excludeOpposite)

    const popularItems = currenciesQuery.currencies
      .filter((item) => POPULAR_CODES.includes(item.iso_code))
      .map(({ iso_code, name }) => `${iso_code}-${name}`)
      .filter(excludeOpposite)

    const otherItems = currenciesQuery.currencies
      .filter((item) => !POPULAR_CODES.includes(item.iso_code))
      .map(({ iso_code, name }) => `${iso_code}-${name}`)
      .filter(excludeOpposite)

    return [
      ...(recentItems.length > 0
        ? [{ icon: <HistoryIcon />, value: 'Recent', items: recentItems }]
        : []),
      { icon: <TrendingUpIcon />, value: 'Popular', items: popularItems },
      ...(otherItems.length > 0
        ? [
            {
              icon: <EarthIcon />,
              value: 'Other currencies',
              items: otherItems,
            },
          ]
        : []),
    ]
  }, [currenciesQuery.currencies, recent, codeToName, oppositeValue])

  if (currenciesQuery.isError) {
    return (
      <div className="text-overline text-red rounded-8 p-2.5 min-h-10 whitespace-nowrap flex items-center">
        Failed to load
      </div>
    )
  }

  return (
    <Combobox
      items={groups}
      value={selectedValue}
      open={isActive}
      onOpenChange={(open) => {
        if (open) {
          setActivePicker(isSender ? 'sender' : 'receiver')
        } else if (isActive) {
          setActivePicker(null)
        }
      }}
      onValueChange={(value) => {
        if (value) pushToRecent(isSender ? 'from' : 'to', value)
        updateUrl({
          [isSender ? 'from' : 'to']: value,
        })
      }}
    >
      <ComboboxTrigger
        className="flex items-center gap-2 shrink-0 border text-body p-2.5 rounded-8 ml-auto"
        render={currenciesQuery.isLoading ? <TriggerSkeleton /> : <Button />}
      >
        {selectedValue && (
          <Image
            src={getFlagUrl(parseCurrency(selectedValue).code)}
            alt={abbreviateCurrencyName(parseCurrency(selectedValue).name)}
            layout="fullWidth"
            className="size-5 rounded-full"
          />
        )}
        <ComboboxValue />
      </ComboboxTrigger>
      <ComboboxContent align="end" className="min-w-77 sm:min-w-94 p-2">
        <ComboboxInput
          showTrigger={false}
          renderIcon={<Search className="size-5" />}
          placeholder="Search currencies..."
          className="min-h-11.5 rounded-6 placeholder:text-overline"
        />
        <ComboboxEmpty>No currencies found.</ComboboxEmpty>
        <ComboboxList className="scrollbar-none mt-2 pb-10">
          {(group) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel className="text-caption text-muted uppercase flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 [&>svg]:size-4">
                  {group.icon}
                  {group.value}
                </span>
                <span>{group.items.length}</span>
              </ComboboxLabel>
              <ComboboxSeparator />
              <ComboboxCollection>
                {(item) => {
                  const { code, name } = parseCurrency(item)
                  const flagUrl = getFlagUrl(code)
                  return (
                    <ComboboxItem
                      key={name}
                      value={code}
                      className="min-h-11.5 rounded-4"
                    >
                      {flagUrl && (
                        <Image
                          src={flagUrl}
                          alt={code}
                          layout="fullWidth"
                          className="size-5 rounded-full"
                        />
                      )}
                      <span className="text-body">{code}</span>
                      <span className="text-caption text-muted">
                        {abbreviateCurrencyName(name)}
                      </span>
                    </ComboboxItem>
                  )
                }}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}

const TriggerSkeleton = () => (
  <button
    disabled
    className="flex items-center justify-between gap-2 text-muted border border-surface-400 bg-surface-500 rounded-8 p-2.5 h-10 w-24.25 shrink-0 disabled:opacity-50"
  >
    <span className="aspect-square animate-pulse rounded-full bg-muted/10 size-5" />
    <span className="w-full h-px bg-current" />
    <ArrowDropDown className="basis-1/4" />
  </button>
)
