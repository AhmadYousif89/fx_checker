import { useState } from 'react'
import { formatForDisplay, useHotkey } from '@tanstack/react-hotkeys'

import { KeyboardShortcutsDialog } from '#/components/keyboard-shortcuts-dialog'

export const Footer = () => {
  const [helpOpen, setHelpOpen] = useState(false)

  useHotkey('Mod+K', () => setHelpOpen((pv) => !pv), { requireReset: true })

  return (
    <>
      <footer className="hidden lg:flex items-center justify-center gap-3 max-w-275 mx-auto w-full px-8 -translate-y-3">
        <p className="text-caption text-muted flex items-center gap-1.5">
          keyboard shortcuts ➞
          <kbd className="px-1.5 py-1 rounded-full text-overline bg-surface-600">
            {formatForDisplay('Mod+K')}
          </kbd>
        </p>
      </footer>
      <KeyboardShortcutsDialog open={helpOpen} onOpenChange={setHelpOpen} />
    </>
  )
}
