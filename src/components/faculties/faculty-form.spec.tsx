import { describe, expect, it, vi } from 'vitest'
import { act, render, screen, type UserEvent } from '../../../test/rtl-helper'
import { createFacultyAction } from '@/lib/faculties/faculties.action'
import { ActionState } from '@/lib/common/types'
import { Faculty } from '@/lib/faculties/faculty.types'
import FacultyForm from './faculty-form'
import { getFacultiesQuery } from '@/lib/faculties/faculties.query'

vi.mock('@/lib/faculties/faculties.action', () => ({
  createFacultyAction: vi.fn(),
}))

vi.mock('@/lib/faculties/faculties.query', () => ({
  getFacultiesQuery: vi.fn(),
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

    it('should disable save button and spinner when pending', async () => {
      let resolveAction!: (v: ActionState<unknown, Faculty>) => void
      vi.mocked(createFacultyAction).mockImplementation(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(<FacultyForm />)

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

      await clickSubmit(user)

      expect(
        await screen.findByRole('region', { name: /notifications/i }),
      ).toBeVisible()
      expect(await screen.findByText('Error title')).toBeVisible()
      expect(await screen.findByText('Error detail')).toBeVisible()
    })

    it('should shows success toast when createFacultyAction is success', async () => {
      vi.mocked(createFacultyAction).mockResolvedValue({
        data: {
          id: 'id',
          name: 'Fakultas baru',
        },
      })

      const { user } = render(<FacultyForm />)

      await clickSubmit(user)

      expect(
        await screen.findByText('Fakultas baru berhasil dibuat'),
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

      const expectedFormData = new FormData()
      expectedFormData.append('name', 'fakultas teknik')
      expect(createFacultyAction).toHaveBeenCalledExactlyOnceWith(
        {},
        expectedFormData,
      )
    })
  })

  describe('Side Effects', () => {
    it('should reload faculties when succeed', async () => {
      const { user } = render(<FacultyForm />)

      await inputName(user, 'fakultas teknik')
      await clickSubmit(user)

      // Initial fetch and when success
      expect(getFacultiesQuery).toHaveBeenCalledTimes(2)
    })
  })
})
