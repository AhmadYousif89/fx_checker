import { formatForDisplay } from '@tanstack/react-hotkeys'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '#/components/ui/alert-dialog'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SHORTCUTS = [
  { keys: 'Mod+K', action: 'Open keyboard shortcuts' },
  { keys: '/', action: 'Open currency picker' },
  { keys: '\u2192', action: 'Switch to receiver picker' },
  { keys: '\u2190', action: 'Switch to sender picker' },
  { keys: '1-6', action: 'Select chart range' },
  { keys: 'Shift+S', action: 'Swap currencies' },
  { keys: 'Shift+H', action: 'Take a screenshot' },
  { keys: 'Shift+T', action: 'Toggle theme' },
  { keys: 'Shift+Right', action: 'Switch to next tab' },
  { keys: 'Shift+Left', action: 'Switch to previous tab' },
] as const

export const KeyboardShortcutsDialog = ({ open, onOpenChange }: Props) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle className="text-center uppercase">
          Keyboard Shortcuts
        </AlertDialogTitle>
        <div className="grid gap-3 mt-4 w-full rounded-10">
          {SHORTCUTS.map(({ keys, action }) => (
            <div
              key={keys}
              className="flex items-center justify-between gap-4 bg-surface-600 py-2 px-4 rounded-8"
            >
              <span className="text-body">{action}</span>
              <kbd className="text-caption px-1.5 py-1 rounded-4 bg-surface-600 border shrink-0 pointer-events-none">
                {formatForDisplay(keys)}
              </kbd>
            </div>
          ))}
        </div>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogAction
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="text-body uppercase"
        >
          Got it
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
