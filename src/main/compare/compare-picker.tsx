import { useMemo } from 'react'
import { Image } from '@unpic/react'
import { SearchIcon } from 'lucide-react'

import { Button } from '#/components/ui/button'
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
} from '#/components/ui/combobox'
import { addComparePick } from '#/store/currencies.store'
import { useCurrenciesQuery } from '#/hooks/use-currencies'
import {
  POPULAR_CODES,
  getFlagUrl,
  abbreviateCurrencyName,
} from '#/lib/currency'

type ComparePickerProps = {
  availableCodes: Set<string>
  sender: string
  receiver: string
  existingCodes: string[]
}

export const ComparePicker = ({
  availableCodes,
  sender,
  receiver,
  existingCodes,
}: ComparePickerProps) => {
  const { currencies } = useCurrenciesQuery()

  const groups = useMemo(() => {
    const filterFn = (c: { iso_code: string }) =>
      c.iso_code !== sender &&
      c.iso_code !== receiver &&
      availableCodes.has(c.iso_code) &&
      !existingCodes.includes(c.iso_code)

    const otherItems = currencies.filter(
      (c) => !POPULAR_CODES.includes(c.iso_code) && filterFn(c),
    )

    return [
      ...(otherItems.length > 0
        ? [
            {
              value: 'Available currencies',
              items: otherItems,
            },
          ]
        : []),
    ]
  }, [currencies, sender, receiver, availableCodes, existingCodes])

  return (
    <Combobox
      items={groups}
      onValueChange={(code) => {
        if (typeof code === 'string' && code) addComparePick(code)
      }}
    >
      <ComboboxTrigger
        render={
          <Button
            variant="ghost"
            className="h-5 text-caption rounded-4! uppercase"
          />
        }
      >
        Add to compare
      </ComboboxTrigger>
      <ComboboxContent align="end" className="min-w-77 sm:min-w-94 p-2">
        <ComboboxInput
          showTrigger={false}
          renderIcon={<SearchIcon className="size-5" />}
          placeholder="Search currencies..."
          className="min-h-11.5 rounded-6 placeholder:text-overline sticky top-0 bg-popover z-10"
        />
        <ComboboxEmpty className="p-4">No currencies found</ComboboxEmpty>
        <ComboboxList className="scrollbar-none py-2">
          {(group: (typeof groups)[number]) => (
            <ComboboxGroup key={group.value} items={group.items}>
              <ComboboxLabel className="text-caption text-muted uppercase flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 [&>svg]:size-4">
                  {group.value}
                </span>
                <span>{group.items.length}</span>
              </ComboboxLabel>
              <ComboboxSeparator />
              <ComboboxCollection>
                {(item: { iso_code: string; name: string }) => {
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
