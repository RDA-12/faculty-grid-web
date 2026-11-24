'use client'

import { queryClient } from '@/lib/common/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'

export default function AppQueryClientProvider({
  children,
}: {
  children: ReactNode
}) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
