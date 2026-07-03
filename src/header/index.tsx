import { Image } from '@unpic/react'
import { Link } from '@tanstack/react-router'

import { LiveTicker } from './live-ticker'
import { HeaderStats } from './stats'
import { ThemeButton } from '#/components/theme.button'

export const Header = () => {
  return (
    <header className="sticky top-0 bg-background z-50">
      <nav className="flex items-center justify-between gap-2 min-h-13 md:min-h-16.5 p-4 md:py-5 md:px-6">
        <Link to="/">
          <Image
            src="/assets/images/logo.svg"
            alt="FX Checker"
            layout="fullWidth"
            className="logo-dark max-md:h-5"
          />
          <Image
            src="/assets/images/logo-light.svg"
            alt="FX Checker"
            layout="fullWidth"
            className="logo-light max-md:h-5"
          />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeButton />
          <HeaderStats />
        </div>
      </nav>
      <LiveTicker />
    </header>
  )
}
