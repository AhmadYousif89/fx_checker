import { useCallback } from 'react'
import { Share2, ArrowLeftRight, MoreVerticalIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { toasts } from '#/lib/notifications'
import { formatRate } from '#/lib/currency'

type Props = {
  sender: string
  receiver: string
  rate: number | null
  flippedRate: number | null
}

export const ConverterActionsMenu = ({
  sender,
  receiver,
  rate,
  flippedRate,
}: Props) => {
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    toasts.push('Link copied to clipboard')
  }, [])

  const handleCopyRate = useCallback(() => {
    if (rate == null || flippedRate == null) return
    const text = `1 ${sender} = ${formatRate(rate)} ${receiver}\n1 ${receiver} = ${formatRate(flippedRate)} ${sender}`
    navigator.clipboard.writeText(text)
    toasts.push('Rate copied to clipboard')
  }, [sender, receiver, rate, flippedRate])

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
        <DropdownMenuItem onClick={handleCopyLink} className="gap-3">
          <Share2 /> Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          disabled={cannotCopyRate}
          onClick={handleCopyRate}
          className="gap-3"
        >
          <ArrowLeftRight className="size-4" /> Copy conversion rate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
