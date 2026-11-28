import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '../../../test/rtl-helper'
import RanksList from './ranks-list'
import type { PaginatedData } from '@/lib/common/pagination'
import { RankType, type Rank } from '@/lib/rank/rank.types'
import { getRanksQuery, type GetRanksQueryResult } from '@/lib/rank/rank.query'
import { internalError } from '../../../test/mock/http-response/common.response'
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

vi.mock('next/navigation', async (importOriginal) => {
  const original: object = await importOriginal()
  return {
    ...original,
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
  }
})
vi.mock('@/lib/rank/rank.query', () => ({
  getRanksQuery: vi.fn().mockResolvedValue({
    data: {
      data: [],
      pagination: { page: 1, pageSize: 5, total: 0 },
    },
  }),
}))

describe('RanksList', () => {
  const initialData: PaginatedData<Rank> = {
    data: [
      {
        id: 'id',
        name: 'Penata Muda (III/a)',
        type: RankType.asn,
      },
    ],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 10,
    },
  }
  const initial: GetRanksQueryResult = {
    data: initialData,
  }
  const replaceMock = vi.fn().mockReturnValue({})
  const pushMock = vi.fn().mockReturnValue({})
  const useRouterMock: unknown = {
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
    it('should shows RanksTable when getRanksQuery is success', () => {
      render(<RanksList initial={initial} />)

      expect(screen.getByTestId('RanksTable')).toBeVisible()
    })

    it('should error text when getRanksQuery is failed', () => {
      render(
        <RanksList
          initial={{
            error: {
              status: 500,
              ...internalError.error,
            },
          }}
        />,
      )

      expect(screen.queryByTestId('RanksTable')).not.toBeInTheDocument()
      expect(screen.getByText(internalError.error.title)).toBeVisible()
      expect(screen.getByText(internalError.error.detail)).toBeVisible()
      expect(screen.getByRole('button', { name: /coba lagi/i })).toBeVisible()
    })

    it('should redirect to logout when error is 401', () => {
      render(
        <RanksList
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

    it('should show loading spinner when getRanksQuery is pending', async () => {
      let resolveAction!: (v: GetRanksQueryResult) => void
      vi.mocked(getRanksQuery).mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(
        <RanksList
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
        <RanksList
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
        <RanksList
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
        <RanksList
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
    it('allows try again to load getRanksQuery', async () => {
      const { user } = render(
        <RanksList
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

      expect(getRanksQuery).toHaveBeenCalledOnce()
    })

    it('allows changing page size', async () => {
      vi.mocked(useSearchParams).mockReturnValueOnce(
        new ReadonlyURLSearchParams({
          page: '1',
          pageSize: '10',
          search: 'penata',
        }),
      )
      const { user } = render(
        <RanksList
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
          `/dashboard/ranks?page=1&pageSize=25&search=penata`,
        ),
      )
    })
  })
})
