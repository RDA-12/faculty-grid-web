import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import FacultiesSearchBar from './faculties-search-bar'
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

describe('FacultiesSearchBar', () => {
  let pushMock = vi.fn().mockReturnValue({})
  let useRouterMock: unknown = {
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
      render(<FacultiesSearchBar />)

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toBeVisible()
      expect(screen.getByPlaceholderText('Fakultas Teknik')).toBeVisible()
      expect(inputEl).toHaveValue('')
    })

    it('should shows search input with default value when provided', () => {
      render(<FacultiesSearchBar initialParams={{ search: 'lol' }} />)

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toBeVisible()
      expect(inputEl).toHaveValue('lol')
    })

    it('should shows clear search input button', () => {
      render(<FacultiesSearchBar initialParams={{ search: 'lol' }} />)

      expect(screen.getByRole('button', { name: /hapus/i }))
    })

    it('should shows add faculty button', () => {
      render(<FacultiesSearchBar />)

      expect(screen.getByTestId('AddFacultyButton')).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should push to correct destination when searched', async () => {
      const { user } = render(<FacultiesSearchBar />)

      await user.type(screen.getByLabelText(/search/i), 'teknik')
      await user.keyboard('{Enter}')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/faculties?pageSize=10&page=1&search=teknik',
      )
    })

    it('should clear search input and push new route when clear search button is pressed', async () => {
      const { user } = render(<FacultiesSearchBar />)

      await user.type(screen.getByLabelText(/search/i), 'teknik')

      const inputEl = screen.getByLabelText(/search/i)
      expect(inputEl).toHaveValue('teknik')

      await user.click(screen.getByRole('button', { name: /hapus/i }))
      expect(inputEl).toHaveValue('')

      expect(pushMock).toHaveBeenCalledExactlyOnceWith(
        '/dashboard/faculties?pageSize=10',
      )
    })
  })
})
