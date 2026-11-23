import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '../../../test/rtl-helper'
import FacultiesList from './faculties-list'
import type { PaginatedData } from '@/lib/common/pagination'
import type { Faculty } from '@/lib/faculties/faculty.types'
import {
  getFacultiesQuery,
  type getFacultiesQueryResult,
} from '@/lib/faculties/faculties.query'
import { internalError } from '../../../test/mock/http-response/common.response'

vi.mock('@/lib/faculties/faculties.query', () => ({
  getFacultiesQuery: vi.fn(),
}))

describe('FacultiesList', () => {
  const initialData: PaginatedData<Faculty> = {
    data: [
      {
        id: 'id',
        name: 'Faculty id',
      },
    ],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 10,
    },
  }
  const initial: getFacultiesQueryResult = {
    data: initialData,
  }

  describe('Render', () => {
    it('should shows FacultiesTable when getFacultiesQuery is success', () => {
      render(<FacultiesList initial={initial} />)

      expect(screen.getByTestId('FacultiesTable')).toBeVisible()
    })

    it('should error text when getFacultiesQuery is failed', () => {
      render(
        <FacultiesList
          initial={{
            error: {
              status: 500,
              ...internalError.error,
            },
          }}
        />,
      )

      expect(screen.queryByTestId('FacultiesTable')).not.toBeInTheDocument()
      expect(screen.getByText(internalError.error.title)).toBeVisible()
      expect(screen.getByText(internalError.error.detail)).toBeVisible()
      expect(screen.getByRole('button', { name: /coba lagi/i })).toBeVisible()
    })

    it('should show spinner when getFacultiesQuery is pending', async () => {
      let resolveAction!: (v: getFacultiesQueryResult) => void
      vi.mocked(getFacultiesQuery).mockImplementation(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(
        <FacultiesList
          initial={{
            error: {
              status: 500,
              ...internalError.error,
            },
          }}
        />,
      )

      await act(async () => {
        await user.click(screen.getByRole('button', { name: /coba lagi/i }))
      })

      expect(screen.getByRole('status')).toBeVisible()

      await act(async () => {
        resolveAction({})
      })

      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('allows try again to load getFacultiesQuery', async () => {
      const { user } = render(
        <FacultiesList
          initial={{
            error: {
              status: 500,
              ...internalError.error,
            },
          }}
        />,
      )

      const buttonEl = screen.getByRole('button', { name: /coba lagi/i })
      expect(buttonEl).toBeVisible()

      await user.click(buttonEl)

      expect(getFacultiesQuery).toHaveBeenCalledOnce()
    })
  })
})
