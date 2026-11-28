import { beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor } from '../../../test/rtl-helper'
import ProgramsList from './programs-list'
import type { PaginatedData } from '@/lib/common/pagination'
import { ProgramDegreeLevel, type Program } from '@/lib/programs/program.types'
import {
  getProgramsQuery,
  type GetProgramsQueryResult,
} from '@/lib/programs/programs.query'
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
vi.mock('@/lib/programs/programs.query', () => ({
  getProgramsQuery: vi.fn().mockResolvedValue({
    data: {
      data: [],
      pagination: { page: 1, pageSize: 5, total: 0 },
    },
  }),
}))
vi.mock('@/lib/programs/programs.action', () => ({
  deleteProgramAction: vi.fn(),
}))

describe('ProgramsList', () => {
  const initialData: PaginatedData<Program> = {
    data: [
      {
        id: 'id',
        name: 'Sistem Informasi',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'faculty-id',
      },
    ],
    pagination: {
      page: 1,
      pageSize: 10,
      total: 10,
    },
  }
  const initial: GetProgramsQueryResult = {
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
    it('should shows ProgramsTable when getProgramsQuery is success', () => {
      render(<ProgramsList initial={initial} />)

      expect(screen.getByTestId('ProgramsTable')).toBeVisible()
    })

    it('should error text when getProgramsQuery is failed', () => {
      render(
        <ProgramsList
          initial={{
            error: {
              status: 500,
              ...internalError.error,
            },
          }}
        />,
      )

      expect(screen.queryByTestId('ProgramsTable')).not.toBeInTheDocument()
      expect(screen.getByText(internalError.error.title)).toBeVisible()
      expect(screen.getByText(internalError.error.detail)).toBeVisible()
      expect(screen.getByRole('button', { name: /coba lagi/i })).toBeVisible()
    })

    it('should redirect to logout when error is 401', () => {
      render(
        <ProgramsList
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

    it('should show loading spinner when getProgramsQuery is pending', async () => {
      let resolveAction!: (v: GetProgramsQueryResult) => void
      vi.mocked(getProgramsQuery).mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(
        <ProgramsList
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
        <ProgramsList
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
        <ProgramsList
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
        <ProgramsList
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
    it('allows try again to load getProgramsQuery', async () => {
      const { user } = render(
        <ProgramsList
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

      expect(getProgramsQuery).toHaveBeenCalledOnce()
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
        <ProgramsList
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
          `/dashboard/programs?page=1&pageSize=25&search=lol`,
        ),
      )
    })
  })
})
