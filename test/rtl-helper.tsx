import React, { ReactElement, type ReactNode } from 'react'
import {
  render,
  renderHook,
  RenderOptions,
  screen,
  waitFor,
  within,
  type RenderHookResult,
} from '@testing-library/react'
import { Toaster } from '@/components/ui/sonner'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/common/query-client'
import { DEFAULT_TOAST_DURATION } from '@/lib/common/config'
import { expect, vi } from 'vitest'

function CommonProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <>
      <TestQueryClientProvider>
        {children}
        <Toaster duration={DEFAULT_TOAST_DURATION} />
      </TestQueryClientProvider>
    </>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: CommonProvider, ...options }),
})

function TestQueryClientProvider({ children }: { children: ReactNode }) {
  queryClient.clear()

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

function customRenderHook<Result, Props = undefined>(
  hook: (initialProps: Props) => Result,
): RenderHookResult<Result, Props> {
  return renderHook(hook, {
    wrapper: TestQueryClientProvider,
  })
}

export * from '@testing-library/react'
export { customRender as render }
export { customRenderHook as renderHook }
export type { UserEvent } from '@testing-library/user-event'
