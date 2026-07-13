import { useCallback } from 'react'
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
  isCopied?: boolean
}

export const ConverterActionsMenu = ({ onCopy, isCopied }: Props) => {
  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href)
    onCopy?.()
  }, [onCopy])

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
          disabled={isCopied}
          onClick={handleCopyLink}
          className="gap-3"
        >
          {isCopied ? (
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
