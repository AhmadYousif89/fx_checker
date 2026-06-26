import { ArrowDownUp, StarIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Button } from '#/components/ui/button'
import { Separator } from '#/components/ui/separator'
import { CurrencyPicker } from '#/components/currency-picker'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useLatestRates } from '#/hooks/use-latest-rates'
import {
  useIsFavorited,
  toggleFavorites,
  swapActivePair,
  useCurrencyStore,
} from '#/store/currencies.store'
import { restrictNumeric, timeAgo, getCrossRate } from '#/lib/currency'

export const RateConverter = () => {
  const navigate = useNavigate()
  const activePair = useCurrencyStore((s) => s.activePair)

  const {
    data: ratesData,
    isLoading,
    isError,
    dataUpdatedAt,
  } = useLatestRates()
  const isFavorited = useIsFavorited()

  const rate = ratesData
    ? getCrossRate(ratesData.rates, activePair.sender, activePair.receiver)
    : null

  return (
    <section
      aria-labelledby="converter-heading"
      className="flex flex-col gap-4"
    >
      <header>
        <h2 id="converter-heading" className="uppercase text-heading">
          check the rate
        </h2>
      </header>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-surface rounded-20"
      >
        <FieldGroup className="gap-4 p-4 md:p-5 md:gap-6 md:flex-row">
          <FieldSet className="basis-full grow">
            <FieldLegend className="sr-only" aria-hidden>
              Send currency
            </FieldLegend>
            <Field className="bg-surface-600 rounded-16 p-4 gap-5 border">
              <FieldLabel className="self-start" htmlFor="send-amount">
                Send
              </FieldLabel>
              <div className="flex items-center justify-between gap-2">
                <Input
                  id="send-amount"
                  name="sendAmount"
                  inputMode="decimal"
                  type="text"
                  placeholder="0"
                  onInput={restrictNumeric}
                  className="max-w-32 border-none text-display-sm md:text-display px-1 placeholder:text-display-sm md:placeholder:text-display"
                />
                <CurrencyPicker isSender />
              </div>
            </Field>
          </FieldSet>

          <Button
            type="button"
            size="icon-lg"
            aria-label="Swap send and receive currencies"
            className="self-center"
            onClick={() => {
              swapActivePair()
              const { activePair } = useCurrencyStore.getState()
              navigate({
                to: '/',
                search: (prev) => ({
                  ...prev,
                  from: activePair.sender,
                  to: activePair.receiver,
                }),
              })
            }}
          >
            <ArrowDownUp className="size-5 md:rotate-90" />
          </Button>

          <FieldSet className="basis-full grow">
            <FieldLegend className="sr-only" aria-hidden>
              Receive currency
            </FieldLegend>
            <Field className="bg-surface-600 rounded-16 p-4 gap-5 border">
              <FieldLabel className="self-start" htmlFor="receive-amount">
                Receive
              </FieldLabel>
              <div className="flex items-center justify-between gap-2">
                <Input
                  id="receive-amount"
                  name="receiveAmount"
                  inputMode="decimal"
                  type="text"
                  placeholder="0"
                  onInput={restrictNumeric}
                  className="max-w-32 border-none text-display-sm md:text-display text-lime! px-1 placeholder:text-display-sm md:placeholder:text-display placeholder:text-muted!"
                />
                <CurrencyPicker />
              </div>
            </Field>
          </FieldSet>
        </FieldGroup>

        <Separator className="border-dashed border bg-transparent" />

        <div className="flex flex-col items-center justify-between gap-4 p-4 md:px-5 md:flex-row">
          <div aria-live="polite">
            {isLoading ? (
              <div className="grid items-center h-6 md:h-5 w-30 md:w-40">
                <div className="rounded-full animate-pulse h-1/2 md:h-full bg-muted/30" />
              </div>
            ) : isError || rate == null ? (
              <p className="text-overline md:text-caption text-red">
                Rate unavailable
              </p>
            ) : (
              <BaseExchangeRate
                base={activePair.sender}
                quote={activePair.receiver}
                rate={rate}
                dataUpdatedAt={dataUpdatedAt}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              size="sm"
              aria-pressed={isFavorited}
              onClick={toggleFavorites}
              className="group uppercase text-caption-medium gap-2.5 aria-pressed:bg-accent aria-pressed:border-accent aria-pressed:text-background"
            >
              <StarIcon className="group-aria-pressed:fill-background" />
              <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="uppercase text-caption-medium"
            >
              Log conversion
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}

type BaseRateProps = {
  base: string
  quote: string
  rate: number
  dataUpdatedAt: number
}

const BaseExchangeRate = ({
  base,
  quote,
  rate,
  dataUpdatedAt,
}: BaseRateProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          className="h-5 p-2.5 rounded-full cursor-default select-text"
        >
          <span className="text-overline md:text-caption">
            1 {base} = {rate.toFixed(4)} {quote}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="hidden md:flex md:flex-col gap-1">
        <span>
          1 {base} = {rate.toFixed(4)} {quote}
        </span>
        <span>
          1 {quote} = {(1 / rate).toFixed(4)} {base}
        </span>
        <span className="border-b border-dotted border-muted" />
        <span className="text-muted">Updated {timeAgo(dataUpdatedAt)}</span>
        <span className="text-muted">Frankfurter (ECB reference rate)</span>
      </TooltipContent>
    </Tooltip>
  )
}
