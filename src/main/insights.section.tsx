import { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCurrencyStore } from '#/store/currencies.store'
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

type TabValue = (typeof tabs)[number]['value']

export const InsightsSection = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('history')
  const logsCount = useCurrencyStore((s) => s.logs.length)
  const favoritesCount = useCurrencyStore((s) => s.favorites.length)

  const counts: Record<string, number> = {
    favorites: favoritesCount,
    logs: logsCount,
  }

  return (
    <div className="grow flex flex-col">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        aria-label="Exchange information"
      >
        <Select
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
        >
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
              {counts[tab.value] > 0 && (
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
            asChild
            forceMount
            value={tab.value}
            aria-labelledby={tab.id}
          >
            <section className="hidden data-[state=active]:grid grid-rows-[auto_1fr]">
              <tab.Component />
            </section>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
