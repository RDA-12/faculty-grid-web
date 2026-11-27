import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '../../../test/rtl-helper'
import FacultiesList from './faculties-list'
import type { PaginatedData } from '@/lib/common/pagination'
import type { Faculty } from '@/lib/faculties/faculty.types'
import {
  getFacultiesQuery,
  type GetFacultiesQueryResult,
} from '@/lib/faculties/faculties.query'
import { internalError } from '../../../test/mock/http-response/common.response'
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

vi.mock('next/navigation', async (importOrginal) => {
  const original: object = await importOrginal()
  return {
    ...original,
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
  }
})
vi.mock('@/lib/faculties/faculties.query', () => ({
  getFacultiesQuery: vi.fn().mockResolvedValue({
    data: {
      data: [],
      pagination: { page: 1, pageSize: 5, total: 0 },
    },
  }),
}))
vi.mock('@/lib/faculties/faculties.action', () => ({
  deleteFacultyAction: vi.fn(),
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
  const initial: GetFacultiesQueryResult = {
    data: initialData,
  }
  let replaceMock = vi.fn().mockReturnValue({})
  let pushMock = vi.fn().mockReturnValue({})
  let useRouterMock: unknown = {
    replace: replaceMock,
    push: pushMock,
  }

  beforeEach(() => {
    vi.mocked(useRouter).mockImplementation(
      () => useRouterMock as AppRouterInstance,
    )
    vi.mocked(useSearchParams).mockImplementation(
      () => new ReadonlyURLSearchParams({ page: '1', pageSize: '10' }),
    )
  })

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

    it('should redirect to logout when error is 401', () => {
      render(
        <FacultiesList
          initial={{
            error: {
              status: 401,
              ...internalError.error,
            },
          }}
        />,
      )

      expect(replaceMock).toHaveBeenCalledExactlyOnceWith('/api/auth/logout')
    })

    it('should show loading toast when getFacultiesQuery is pending', async () => {
      let resolveAction!: (v: GetFacultiesQueryResult) => void
      vi.mocked(getFacultiesQuery).mockImplementationOnce(
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

      await user.click(screen.getByRole('button', { name: /coba lagi/i }))

      await waitFor(() => expect(screen.getByRole('status')).toBeVisible())

      await act(async () => {
        resolveAction({
          data: {
            data: [],
            pagination: {
              page: 1,
              pageSize: 10,
              total: 0,
            },
          },
        })
      })

      await waitFor(() =>
        expect(screen.queryByRole('status')).not.toBeInTheDocument(),
      )
    })

    it('should shows pagination', () => {
      render(
        <FacultiesList
          initial={{
            data: {
              ...initialData,
              pagination: { page: 2, pageSize: 5, total: 100 },
            },
          }}
        />,
      )

      expect(
        screen.getByRole('combobox', { name: /data per halaman/i }),
      ).toBeVisible()
      expect(
        screen.getByRole('navigation', { name: /pagination/i }),
      ).toBeVisible()
      expect(screen.getByRole('link', { name: /selanjutnya/i })).toBeVisible()
      expect(screen.getByRole('link', { name: /sebelumnya/i })).toBeVisible()
    })

    it('should shows disabled prev when there is no prev page', () => {
      render(
        <FacultiesList
          initial={{
            data: {
              ...initialData,
              pagination: { page: 1, pageSize: 5, total: 100 },
            },
          }}
        />,
      )

      expect(
        screen.getByRole('combobox', { name: /data per halaman/i }),
      ).toBeVisible()
      expect(
        screen.getByRole('navigation', { name: /pagination/i }),
      ).toBeVisible()
      expect(screen.getByRole('button', { name: /sebelumnya/i })).toBeDisabled()
    })

    it('should shows disabled next when there is no next page', () => {
      render(
        <FacultiesList
          initial={{
            data: {
              ...initialData,
              pagination: { page: 2, pageSize: 5, total: 10 },
            },
          }}
        />,
      )

      expect(
        screen.getByRole('combobox', { name: /data per halaman/i }),
      ).toBeVisible()
      expect(
        screen.getByRole('navigation', { name: /pagination/i }),
      ).toBeVisible()
      expect(
        screen.getByRole('button', { name: /selanjutnya/i }),
      ).toBeDisabled()
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

    it('allows changing page size', async () => {
      vi.mocked(useSearchParams).mockReturnValueOnce(
        new ReadonlyURLSearchParams({
          page: '1',
          pageSize: '10',
          search: 'lol',
        }),
      )
      const { user } = render(
        <FacultiesList
          initial={{
            data: {
              ...initialData,
              pagination: {
                page: 1,
                pageSize: 10,
                total: 10,
              },
            },
          }}
        />,
      )

      const pageSelectorEl = screen.getByRole('combobox', {
        name: /data per halaman/i,
      })
      expect(pageSelectorEl).toBeVisible()
      await user.click(pageSelectorEl)
      const optionEl = screen.getByRole('option', { name: '25', hidden: true })
      await waitFor(() => expect(optionEl).toBeVisible())
      await user.click(optionEl)

      await waitFor(() =>
        expect(pushMock).toHaveBeenCalledExactlyOnceWith(
          `/dashboard/faculties?page=1&pageSize=25&search=lol`,
        ),
      )
    })
  })
})
