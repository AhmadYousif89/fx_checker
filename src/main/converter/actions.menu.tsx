import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '#/components/ui/dropdown-menu'
import { Button } from '#/components/ui/button'
import { CopyIcon, MoreVerticalIcon } from 'lucide-react'

export const ConverterActionsMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="max-md:absolute max-md:top-0 max-md:right-0"
        >
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6}>
        <DropdownMenuItem className="gap-3">
          <CopyIcon /> Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
