import { useSearch, useHydrated } from '@tanstack/react-router'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrencyStore } from '#/store/currencies.store'
import { useUpdateUrl } from '#/hooks/use-update-url'
import { HistorySection } from './history'
import { FavoritesSection } from './favorites'
import { CompareSection } from './compare'
import { LogsSection } from './logs'

const tabs = [
  {
    value: 'history',
    label: 'History',
    id: 'tab-history',
    controls: 'panel-history',
    Component: HistorySection,
  },
  {
    value: 'favorites',
    label: 'Favorites',
    id: 'tab-favorites',
    controls: 'panel-favorites',
    Component: FavoritesSection,
  },
  {
    value: 'compare',
    label: 'Compare',
    id: 'tab-compare',
    controls: 'panel-compare',
    Component: CompareSection,
  },
  {
    value: 'logs',
    label: 'Logs',
    id: 'tab-logs',
    controls: 'panel-logs',
    Component: LogsSection,
  },
] as const

export const InsightsSection = () => {
  const { tab: tabParam } = useSearch({ from: '/' })
  const activeTab = tabParam ?? 'history'
  const logsCount = useCurrencyStore((s) => s.logs.length)
  const favoritesCount = useCurrencyStore((s) => s.favorites.length)
  const updateUrl = useUpdateUrl()
  const hydrated = useHydrated()

  const handleTabChange = (v: string) => updateUrl({ tab: v })

  const counts: Record<string, number> = {
    favorites: favoritesCount,
    logs: logsCount,
  }

  const renderCounters = (v: string) =>
    (v in counts && !hydrated) || counts[v] > 0

  return (
    <div className="grow flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        aria-label="Exchange information"
      >
        <Select value={activeTab} onValueChange={handleTabChange}>
          <SelectTrigger className="md:hidden w-full" aria-label="Select view">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {tabs.map((tab) => (
              <SelectItem key={tab.value} value={tab.value}>
                {tab.label}
                {counts[tab.value] > 0 && (
                  <span className="aspect-square bg-accent-darker text-accent text-overline size-5 rounded-full flex items-center justify-center">
                    {counts[tab.value]}
                  </span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <TabsList className="hidden md:flex border-b">
          {tabs.map((tab) => (
            <TabsTrigger
              id={tab.id}
              key={tab.value}
              value={tab.value}
              aria-controls={tab.controls}
              className="hover:border-b-accent"
            >
              {tab.label}
              {renderCounters(tab.value) && (
                <span className="aspect-square bg-accent-darker text-accent text-overline size-5 rounded-full flex items-center justify-center">
                  {counts[tab.value]}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent
            key={tab.value}
            value={tab.value}
            aria-labelledby={tab.id}
          >
            <tab.Component />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
