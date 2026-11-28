import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import RanksSearchBar from './ranks-search-bar'
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

describe('RanksSearchBar', () => {
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
      render(<RanksSearchBar />)

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toBeVisible()
      expect(screen.getByPlaceholderText('Penata Muda (III/a)')).toBeVisible()
      expect(inputEl).toHaveValue('')
    })

    it('should shows search input with default value when provided', () => {
      render(<RanksSearchBar initialParams={{ search: 'penata' }} />)

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toBeVisible()
      expect(inputEl).toHaveValue('penata')
    })

    it('should shows clear search input button', () => {
      render(<RanksSearchBar initialParams={{ search: 'penata' }} />)

      expect(screen.getByRole('button', { name: /hapus/i })).toBeVisible()
    })

    it('should shows add rank button', () => {
      render(<RanksSearchBar />)

      expect(screen.getByTestId('AddRankButton')).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should push to correct destination when searched', async () => {
      const { user } = render(<RanksSearchBar />)

      await user.type(screen.getByLabelText(/search/i), 'penata')
      await user.keyboard('{Enter}')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/ranks?pageSize=10&page=1&search=penata',
      )
    })

    it('should clear search input and push new route when clear search button is pressed', async () => {
      const { user } = render(<RanksSearchBar />)

      await user.type(screen.getByLabelText(/search/i), 'penata')

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toHaveValue('penata')

      await user.click(screen.getByRole('button', { name: /hapus/i }))
      expect(inputEl).toHaveValue('')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/ranks?pageSize=10',
      )
    })

    it('should clear prefilled search input and push new route when clear search button is pressed', async () => {
      const { user } = render(
        <RanksSearchBar initialParams={{ search: 'penata' }} />,
      )

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toHaveValue('penata')

      await user.click(screen.getByRole('button', { name: /hapus/i }))
      expect(inputEl).toHaveValue('')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/ranks?pageSize=10',
      )
    })
  })
})
