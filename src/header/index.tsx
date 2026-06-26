import { Image } from '@unpic/react'
import { LiveTicker } from './live-ticker'
import { HeaderStats } from './stats'
import { Link } from '@tanstack/react-router'

export const Header = () => {
  return (
    <header className="sticky top-0 bg-background z-500">
      <nav className="flex items-center justify-between gap-2 min-h-13 md:min-h-16.5 p-4 md:py-5 md:px-6">
        <Link to="/">
          <Image
            src="/assets/images/logo.svg"
            layout="fullWidth"
            className="max-md:h-5"
          />
        </Link>
        <HeaderStats />
      </nav>
      <LiveTicker />
    </header>
  )
}
