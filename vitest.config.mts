import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    environment: 'jsdom',
    root: './',
    include: ['**/*.spec{.tsx,.ts}'],
    setupFiles: ['./rtl.vitest.setup.ts'],
    env: {
      NEXT_PUBLIC_API_URL: 'http://localhost:8000',
    },
  },
})
