import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Toaster } from '@/components/ui/sonner'
import userEvent from '@testing-library/user-event'

function ToasterProvider({
  children,
}: {
  children: React.ReactNode
}): React.ReactNode {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: ToasterProvider, ...options }),
})

export * from '@testing-library/react'
export { customRender as render }
export type { UserEvent } from '@testing-library/user-event'
