import { useThemeStore } from '#/store/theme.store'
import { MoonIcon, SunIcon } from 'lucide-react'
import { Button } from './ui/button'
import { useHotkey } from '@tanstack/react-hotkeys'

export const ThemeButton = () => {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  useHotkey('Shift+T', () => toggleTheme(), { requireReset: true })

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="h-6.5 rounded w-7"
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </Button>
  )
}
