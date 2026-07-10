import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { clearLogs } from '#/store/currencies.store'
import { DownloadIcon } from 'lucide-react'

type ExportMenuProps = {
  handleExportCsv: () => void
  handleExportJson: () => void
}

export const ExportMenu = ({
  handleExportCsv,
  handleExportJson,
}: ExportMenuProps) => {
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="h-7.5 md:w-auto px-3 py-2 text-caption"
          >
            <DownloadIcon />
            <span className="hidden md:inline">Export</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExportCsv}>
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJson}>
            Export as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button className="h-7.5 px-3 py-2 text-caption hover:text-[white] hover:bg-red hover:border-red focus-visible:ring-red">
            Clear All
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all logs?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all conversion logs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-body">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={clearLogs}
              variant="destructive"
              className="text-[white]! text-body"
            >
              Yes, clear all
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
