import { useState, useEffect, useCallback, useRef } from 'react'
import { ArrowDownUp, Check, StarIcon } from 'lucide-react'
import { useHotkey } from '@tanstack/react-hotkeys'

import { Button } from '#/components/ui/button'
import { FieldGroup } from '#/components/ui/field'
import { Separator } from '#/components/ui/separator'

import { useLatestRates } from '#/hooks/use-latest-rates'
import { useActivePair } from '#/hooks/use-active-pair'
import { useUpdateUrl } from '#/hooks/use-update-url'
import {
  addLog,
  useIsFavorited,
  toggleFavorite,
  setActivePicker,
  useCurrencyStore,
} from '#/store/currencies.store'
import {
  restrictNumeric,
  getCrossRate,
  formatAmount,
  formatInputAmount,
} from '#/lib/currency'
import { cn } from '#/lib/utils'

import { SendField } from './converter/send.field'
import { ReceiverField } from './converter/receiver.field'
import { BaseExchangeRate } from './converter/base-rate'

type EditSide = 'send' | 'receive'
type LogStatus = 'idle' | 'created' | 'updated'

export const RateConverter = () => {
  const updateUrl = useUpdateUrl()
  const { sender, receiver, amount: urlAmount, swap } = useActivePair()
  const isFavorited = useIsFavorited(sender, receiver)
  const activePicker = useCurrencyStore((s) => s.activePicker)
  const lastActivePicker = useCurrencyStore((s) => s.lastActivePicker)

  const [sendValue, setSendValue] = useState(urlAmount)
  const [receiveValue, setReceiveValue] = useState('')
  const [editSide, setEditSide] = useState<EditSide>('send')
  const [logBtnStatus, setLogBtnStatus] = useState<LogStatus>('idle')

  const sendInputRef = useRef<HTMLInputElement>(null)
  const receiveInputRef = useRef<HTMLInputElement>(null)

  const {
    data: ratesData,
    isLoading,
    isFetching,
    isError,
    dataUpdatedAt,
  } = useLatestRates()

  const rate = ratesData
    ? getCrossRate({
        rates: ratesData.rates,
        base: sender,
        quote: receiver,
      })
    : null

  const displaySendValue =
    editSide === 'send' ? formatInputAmount(sendValue) : sendValue
  const displayReceiveValue =
    editSide === 'receive' ? formatInputAmount(receiveValue) : receiveValue

  const sendNum = parseFloat(sendValue)
  const isAmountValid = !Number.isNaN(sendNum) && sendNum > 0

  useHotkey(
    '/',
    () => {
      if (activePicker) setActivePicker(null)
      else setActivePicker(lastActivePicker ?? 'sender')
    },
    { requireReset: true, ignoreInputs: false },
  )

  useHotkey(
    'Shift+S',
    () => {
      swap()
      setEditSide('send')
    },
    { requireReset: true },
  )

  // Handle switching between send and receive inputs with arrow keys
  useEffect(() => {
    if (!activePicker) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && activePicker === 'sender') {
        e.preventDefault()
        e.stopPropagation()
        setActivePicker('receiver')
      }
      if (e.key === 'ArrowLeft' && activePicker === 'receiver') {
        e.preventDefault()
        e.stopPropagation()
        setActivePicker('sender')
      }
    }

    window.addEventListener('keydown', handler, { capture: true })
    return () =>
      window.removeEventListener('keydown', handler, { capture: true })
  }, [activePicker])

  // If the URL amount changes, update the send value
  useEffect(() => {
    if (urlAmount && editSide === 'send') {
      setSendValue(urlAmount)
    }
  }, [urlAmount, editSide])

  // Sync receive from send
  useEffect(() => {
    if (rate == null || editSide !== 'send') return
    const num = parseFloat(sendValue)
    if (!Number.isNaN(num) && num > 0) {
      setReceiveValue(formatAmount(num * rate))
    } else {
      setReceiveValue('')
    }
  }, [rate, sendValue, editSide])

  // Sync send from receive
  useEffect(() => {
    if (rate == null || editSide !== 'receive') return
    const num = parseFloat(receiveValue.replace(/,/g, ''))
    if (!Number.isNaN(num) && num > 0) {
      setSendValue(formatAmount(num / rate))
    } else {
      setSendValue('')
    }
  }, [rate, receiveValue, editSide])

  const handleSendInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.currentTarget.value.replace(/,/g, '')
      const sanitized = restrictNumeric(raw)

      const cursor = e.currentTarget.selectionStart ?? 0
      const rawBefore = raw.slice(0, cursor)
      const formattedBefore = formatInputAmount(rawBefore)
      const newCursor = formattedBefore.length

      setSendValue(sanitized)
      setEditSide('send')

      const parsed = parseFloat(sanitized)
      updateUrl({ amount: !sanitized || parsed === 0 ? '1' : sanitized })

      requestAnimationFrame(() => {
        sendInputRef.current?.setSelectionRange(newCursor, newCursor)
      })
    },
    [updateUrl],
  )

  const handleReceiveInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.currentTarget.value.replace(/,/g, '')
      const sanitized = restrictNumeric(raw)

      const cursor = e.currentTarget.selectionStart ?? 0
      const rawBefore = raw.slice(0, cursor)
      const formattedBefore = formatInputAmount(rawBefore)
      const newCursor = formattedBefore.length

      setReceiveValue(sanitized)
      setEditSide('receive')

      if (rate != null) {
        const num = parseFloat(sanitized)
        if (!Number.isNaN(num) && num > 0) {
          updateUrl({ amount: (num / rate).toFixed(2).toString() })
        } else {
          updateUrl({ amount: '1' })
        }
      }

      requestAnimationFrame(() => {
        receiveInputRef.current?.setSelectionRange(newCursor, newCursor)
      })
    },
    [rate, updateUrl],
  )

  const handleLogConversion = useCallback(() => {
    if (rate == null) return

    const amount = parseFloat(sendValue)
    if (Number.isNaN(amount) || amount <= 0) return
    const status = addLog({
      sender,
      receiver,
      amount,
      baseRate: rate,
      result: amount * rate,
      timestamp: Date.now(),
    })

    setLogBtnStatus(status)
    setTimeout(() => setLogBtnStatus('idle'), 2000)
  }, [rate, sendValue, sender, receiver])

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
        autoComplete="off"
        className="bg-surface rounded-20"
      >
        <FieldGroup className="gap-4 p-4 md:p-5 md:gap-6 md:flex-row">
          <SendField
            value={displaySendValue}
            onChange={handleSendInput}
            ref={sendInputRef}
          />

          <Button
            type="button"
            size="icon-lg"
            aria-label="Swap send and receive currencies"
            className="self-center"
            onClick={() => {
              swap()
              setEditSide('send')
            }}
          >
            <ArrowDownUp className="size-5 md:rotate-90" />
          </Button>

          <ReceiverField
            value={displayReceiveValue}
            onChange={handleReceiveInput}
            isLoading={isLoading || isFetching}
            ref={receiveInputRef}
          />
        </FieldGroup>

        <Separator className="border-dashed border bg-transparent" />

        <div className="flex flex-col items-center justify-between gap-4 p-4 md:px-5 md:flex-row">
          <div aria-live="polite">
            {isLoading ? (
              <div className="grid items-center h-6 md:h-5 w-30 md:w-40">
                <div className="rounded-full animate-pulse h-1/2 md:h-full bg-muted/10" />
              </div>
            ) : isError || rate == null ? (
              <p className="text-overline md:text-caption text-red">
                Rate unavailable
              </p>
            ) : (
              <BaseExchangeRate
                base={sender}
                quote={receiver}
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
              onClick={() => toggleFavorite(sender, receiver)}
              className="group min-w-29.5 uppercase text-caption-medium gap-2.5 aria-pressed:bg-accent aria-pressed:border-accent aria-pressed:text-background"
            >
              <StarIcon className="group-aria-pressed:fill-background" />
              <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={logBtnStatus !== 'idle' || !isAmountValid}
              className={cn(
                'min-w-33.5 text-caption-medium transition-all',
                logBtnStatus !== 'idle' &&
                  'disabled:opacity-100 bg-accent text-background! hover:bg-accent',
              )}
              onClick={handleLogConversion}
            >
              {logBtnStatus === 'created' ? (
                <span className="flex items-center gap-2">
                  <Check /> Logged
                </span>
              ) : logBtnStatus === 'updated' ? (
                <span className="flex items-center gap-2">
                  <Check /> Updated
                </span>
              ) : (
                <span className="uppercase">Log conversion</span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}
