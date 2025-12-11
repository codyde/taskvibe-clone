import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  plugins: [
    // this is the plugin that enables path aliases
    viteTsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
  ],
  nitro: {},
  server: {
    allowedHosts: ['.trycloudflare.com', '.up.railway.app']
  },
  // Make sure server-only dependencies are externalized
  ssr: {
    external: ['better-auth', '@neondatabase/serverless', 'drizzle-orm'],
  },
})

export default config
