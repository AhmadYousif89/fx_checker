import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    {
      name: 'econnreset-handler',
      configureServer(server) {
        server.httpServer?.on('error', (err: NodeJS.ErrnoException) => {
          if (err.code === 'ECONNRESET' || err.code === 'ECONNABORTED') return
          console.error('[server error]', err)
        })
      },
    },
    devtools(),
    tailwindcss(),
    nitro(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
