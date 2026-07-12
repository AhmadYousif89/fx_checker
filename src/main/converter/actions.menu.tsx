import { useCallback, useState } from 'react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { Check, CopyIcon, MoreVerticalIcon } from 'lucide-react'

type Props = {
  onCopy?: () => void
}

export const ConverterActionsMenu = ({ onCopy }: Props) => {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    onCopy?.()
    setTimeout(() => setCopied(false), 2000)
  }, [onCopy])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="max-md:absolute max-md:top-0 max-md:right-0"
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuItem
          className="gap-3"
          onClick={handleCopyLink}
          disabled={copied}
        >
          {copied ? (
            <>
              <Check className="size-4 text-green" /> Copied!
            </>
          ) : (
            <>
              <CopyIcon /> Copy link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
