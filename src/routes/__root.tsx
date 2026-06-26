import {
  Link,
  Scripts,
  HeadContent,
  createRootRouteWithContext,
} from '@tanstack/react-router'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'FX Checker',
      },
      {
        name: 'description',
        content: 'A Foreign Exchange Rate Converter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/assets/icon.svg',
      },
    ],
  }),
  shellComponent: RootDocument,
  errorComponent: () => {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Something went wrong!</p>
        <Link to="/">Go home</Link>
      </div>
    )
  },
  notFoundComponent: () => {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Not found!</p>
        <Link to="/">Go home</Link>
      </div>
    )
  },
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Scripts />
      </body>
    </html>
  )
}
