import { defineConfig } from 'vitest/config'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [viteReact()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/vitest.setup.tsx'],
    css: false,
    server: {
      deps: {
        inline: ['@tanstack/react-router'],
      },
    },
  },
})
