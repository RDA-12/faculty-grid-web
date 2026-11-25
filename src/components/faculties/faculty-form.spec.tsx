import { describe, expect, it, vi } from 'vitest'
import {
  act,
  render,
  screen,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import { createFacultyAction } from '@/lib/faculties/faculties.action'
import { ActionState } from '@/lib/common/types'
import { Faculty } from '@/lib/faculties/faculty.types'
import FacultyForm from './faculty-form'
import type { CreateFacultyRequest } from '@/lib/faculties/faculties.schema'

vi.mock('@/lib/faculties/faculties.action', () => ({
  createFacultyAction: vi.fn(),
}))

vi.mock('@/lib/faculties/faculties.query', () => ({
  getFacultiesQuery: vi.fn().mockResolvedValue({
    data: {
      data: [],
      pagination: { page: 1, pageSize: 5, total: 0 },
    },
  }),
}))

describe('FacultyForm', () => {
  async function clickSubmit(user: UserEvent) {
    await user.click(screen.getByRole('button', { name: /buat fakultas/i }))
  }

  async function inputName(user: UserEvent, name: string) {
    const inputEl = screen.getByLabelText(/nama fakultas/i)
    await user.type(inputEl, name)
    return inputEl
  }

  describe('Render', () => {
    it('should shows name field', () => {
      render(<FacultyForm />)

      expect(screen.getByLabelText(/nama fakultas/i)).toBeVisible()
      expect(screen.getByPlaceholderText(/fakultas teknik/i)).toBeVisible()
    })

    it('should shows save button', () => {
      render(<FacultyForm />)

      expect(
        screen.getByRole('button', { name: /buat fakultas/i }),
      ).toBeVisible()
    })

    it('should disable save button and show spinner when pending', async () => {
      let resolveAction!: (v: ActionState<unknown, Faculty>) => void
      vi.mocked(createFacultyAction).mockImplementation(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(<FacultyForm />)

      await inputName(user, 'fakultas')
      await clickSubmit(user)

      expect(
        screen.getByRole('button', { name: /buat fakultas/i }),
      ).toBeDisabled()
      expect(screen.getByRole('status')).toBeVisible()

      await act(async () => {
        resolveAction({ data: undefined })
      })

      expect(
        screen.getByRole('button', { name: /buat fakultas/i }),
      ).not.toBeDisabled()
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should shows error when submit with invalid name', async () => {
      vi.mocked(createFacultyAction).mockResolvedValue({
        errors: {
          name: 'Wajib diisi',
        },
      })

      const { user } = render(<FacultyForm />)

      await clickSubmit(user)

      expect(screen.getByText('Wajib diisi')).toBeVisible()
    })

    it('should shows error toast when createFacultyAction is failed', async () => {
      vi.mocked(createFacultyAction).mockResolvedValue({
        error: {
          status: 401,
          title: 'Error title',
          detail: 'Error detail',
        },
      })

      const { user } = render(<FacultyForm />)

      await inputName(user, 'fakultas')
      await clickSubmit(user)

      const regionEL = screen.getByRole('region', { name: /notifications/i })
      expect(within(regionEL).getByText('Error title')).toBeVisible()
      expect(within(regionEL).getByText('Error detail')).toBeVisible()
    })

    it('should shows success toast when createFacultyAction is success', async () => {
      vi.mocked(createFacultyAction).mockResolvedValue({
        data: {
          id: 'id',
          name: 'Fakultas baru',
        },
      })

      const { user } = render(<FacultyForm />)

      await inputName(user, 'fakultas')
      await clickSubmit(user)

      expect(
        within(
          screen.getByRole('region', { name: /notifications/i }),
        ).getByText('Fakultas baru berhasil dibuat'),
      ).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('allows input name', async () => {
      const { user } = render(<FacultyForm />)

      const nameInputEl = await inputName(user, 'fakultas teknik')

      expect(nameInputEl).toHaveValue('fakultas teknik')
    })

    it('should call createFacultyAction with correct data', async () => {
      const { user } = render(<FacultyForm />)

      await inputName(user, 'fakultas teknik')
      await clickSubmit(user)

      const expectedArgs: CreateFacultyRequest = {
        name: 'fakultas teknik',
      }
      expect(createFacultyAction).toHaveBeenCalledExactlyOnceWith(expectedArgs)
    })
  })
})
