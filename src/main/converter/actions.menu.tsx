import { useCallback } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { ArrowLeftRight, Check, CopyIcon, MoreVerticalIcon } from 'lucide-react'
import { formatRate } from '#/lib/currency'

type Props = {
  sender: string
  receiver: string
  rate: number | null
  flippedRate: number | null
  onCopy?: (type: 'link' | 'rate') => void
  copiedType?: 'link' | 'rate' | null
}

export const ConverterActionsMenu = ({
  sender,
  receiver,
  rate,
  flippedRate,
  onCopy,
  copiedType,
}: Props) => {
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    onCopy?.('link')
  }, [onCopy])

  const handleCopyRate = useCallback(() => {
    if (rate == null || flippedRate == null) return
    const text = `1 ${sender} = ${formatRate(rate)} ${receiver}\n1 ${receiver} = ${formatRate(flippedRate)} ${sender}`
    navigator.clipboard.writeText(text)
    onCopy?.('rate')
  }, [sender, receiver, rate, flippedRate, onCopy])

  const cannotCopyRate = rate == null || flippedRate == null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="max-md:absolute max-md:top-0 max-md:-right-3"
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuItem
          disabled={copiedType === 'link'}
          onClick={handleCopyLink}
          className="gap-3"
        >
          {copiedType === 'link' ? (
            <>
              <Check className="size-4 text-green" /> Copied!
            </>
          ) : (
            <>
              <CopyIcon /> Copy link
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={cannotCopyRate || copiedType === 'rate'}
          onClick={handleCopyRate}
          className="gap-3"
        >
          {copiedType === 'rate' ? (
            <>
              <Check className="size-4 text-green" /> Copied!
            </>
          ) : (
            <>
              <ArrowLeftRight className="size-4" /> Copy conversion rate
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
