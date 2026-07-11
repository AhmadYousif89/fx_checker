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
} from '../../components/ui/combobox'
import { Button } from '../../components/ui/button'
import { useCurrenciesQuery } from '#/hooks/use-currencies'

import {
  getFlagUrl,
  POPULAR_CODES,
  abbreviateCurrencyName,
} from '#/lib/currency'
import { ArrowDropDown } from '../../components/icons/arrow-drop-down'
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
  const { from = 'USD', to = 'EUR' } = useSearch({ from: '/' })
  const selectedValue = isSender ? from : to
  const oppositeValue = isSender ? to : from

  const updateUrl = useUpdateUrl()
  const { currencies, isLoading, isError } = useCurrenciesQuery()

  const recent = useCurrencyStore((s) =>
    isSender ? s.recent.from : s.recent.to,
  )
  const activePicker = useCurrencyStore((s) => s.activePicker)
  const isActive = isSender
    ? activePicker === 'sender'
    : activePicker === 'receiver'

  const groups = useMemo(() => {
    if (!currencies.length) return []

    const recentItems = currencies.filter(
      (c) => recent.includes(c.iso_code) && c.iso_code !== oppositeValue,
    )
    const popularItems = currencies.filter(
      (c) => POPULAR_CODES.includes(c.iso_code) && c.iso_code !== oppositeValue,
    )
    const otherItems = currencies.filter(
      (c) =>
        !POPULAR_CODES.includes(c.iso_code) && c.iso_code !== oppositeValue,
    )

    return [
      ...(recentItems.length > 0
        ? [
            {
              icon: <HistoryIcon />,
              value: 'Recent',
              items: recentItems,
            },
          ]
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
  }, [currencies, recent, oppositeValue])

  if (isError) {
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
      onValueChange={(code) => {
        if (!code) return
        pushToRecent(isSender ? 'from' : 'to', code)
        updateUrl({ [isSender ? 'from' : 'to']: code })
      }}
    >
      <ComboboxTrigger
        className="flex items-center gap-2 shrink-0 border text-body p-2.5 rounded-8 ml-auto"
        render={isLoading ? <TriggerSkeleton /> : <Button />}
      >
        {selectedValue && (
          <Image
            src={getFlagUrl(selectedValue)}
            alt={abbreviateCurrencyName(selectedValue)}
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
          className="min-h-11.5 rounded-6 placeholder:text-overline sticky top-0 bg-popover z-10"
        />
        <ComboboxEmpty className="p-4">No currencies found.</ComboboxEmpty>
        <ComboboxList className="scrollbar-none py-2">
          {(group: (typeof groups)[number]) => (
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
                  const flagUrl = getFlagUrl(item.iso_code)
                  return (
                    <ComboboxItem
                      key={item.iso_code}
                      value={item.iso_code}
                      className="min-h-11.5 rounded-4"
                    >
                      {flagUrl && (
                        <Image
                          src={flagUrl}
                          alt={item.iso_code}
                          layout="fullWidth"
                          className="size-5 rounded-full"
                        />
                      )}
                      <span className="text-body">{item.iso_code}</span>
                      <span className="text-caption text-muted">
                        {abbreviateCurrencyName(item.name)}
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
