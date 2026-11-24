import { QueryClient } from '@tanstack/react-query'
import { DEFAULT_STALE_TIME } from './config'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: DEFAULT_STALE_TIME,
    },
  },
})
