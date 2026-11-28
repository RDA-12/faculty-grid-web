import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import ProgramsSearchBar from './programs-search-bar'
import {
  ReadonlyURLSearchParams,
  useRouter,
  useSearchParams,
} from 'next/navigation'
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

vi.mock('next/navigation', async (importOriginal) => {
  const actual: object = await importOriginal()
  return {
    ...actual,
    useSearchParams: vi.fn(),
    useRouter: vi.fn(),
  }
})

describe('ProgramsSearchBar', () => {
  const pushMock = vi.fn().mockReturnValue({})
  const useRouterMock: unknown = {
    push: pushMock,
  }

  beforeEach(() => {
    vi.mocked(useRouter).mockImplementation(
      () => useRouterMock as AppRouterInstance,
    )
    vi.mocked(useSearchParams).mockReturnValue(
      new ReadonlyURLSearchParams({ pageSize: '10' }),
    )
  })

  describe('Render', () => {
    it('should shows search input', () => {
      render(<ProgramsSearchBar />)

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toBeVisible()
      expect(screen.getByPlaceholderText('Sistem Informasi')).toBeVisible()
      expect(inputEl).toHaveValue('')
    })

    it('should shows search input with default value when provided', () => {
      render(<ProgramsSearchBar initialParams={{ search: 'sistem' }} />)

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toBeVisible()
      expect(inputEl).toHaveValue('sistem')
    })

    it('should shows clear search input button', () => {
      render(<ProgramsSearchBar initialParams={{ search: 'sistem' }} />)

      expect(screen.getByRole('button', { name: /hapus/i })).toBeVisible()
    })

    it('should shows add program button', () => {
      render(<ProgramsSearchBar />)

      expect(screen.getByTestId('AddProgramButton')).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should push to correct destination when searched', async () => {
      const { user } = render(<ProgramsSearchBar />)

      await user.type(screen.getByLabelText(/search/i), 'sistem')
      await user.keyboard('{Enter}')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/programs?pageSize=10&page=1&search=sistem',
      )
    })

    it('should clear search input and push new route when clear search button is pressed', async () => {
      const { user } = render(<ProgramsSearchBar />)

      await user.type(screen.getByLabelText(/search/i), 'sistem')

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toHaveValue('sistem')

      await user.click(screen.getByRole('button', { name: /hapus/i }))
      expect(inputEl).toHaveValue('')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/programs?pageSize=10',
      )
    })

    it('should clear prefilled search input and push new route when clear search button is pressed', async () => {
      const { user } = render(
        <ProgramsSearchBar initialParams={{ search: 'sistem' }} />,
      )

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toHaveValue('sistem')

      await user.click(screen.getByRole('button', { name: /hapus/i }))
      expect(inputEl).toHaveValue('')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/programs?pageSize=10',
      )
    })
  })
})
