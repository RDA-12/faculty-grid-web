import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    pool: 'vmThreads',
    environment: 'jsdom',
    root: './',
    include: ['**/*.spec{.tsx,.ts}'],
    setupFiles: ['./rtl.vitest.setup.ts'],
    env: {
      BACKEND_API_URL: 'http://localhost:8000',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
    },
  },
})
