import { useLayoutEffect } from 'react'
import { useThemeStore } from '#/store/theme.store'

export const ThemeEffect = () => {
  const theme = useThemeStore((s) => s.theme)

  useLayoutEffect(() => {
    const root = document.documentElement
    const isLight = theme === 'light'

    root.classList.add('no-transition')
    root.classList.toggle('light', isLight)

    const frameId = requestAnimationFrame(() => {
      root.classList.remove('no-transition')
    })

    return () => {
      cancelAnimationFrame(frameId)
    }
  }, [theme])

  return null
}
