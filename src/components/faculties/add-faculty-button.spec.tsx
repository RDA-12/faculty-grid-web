import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import AddFacultyButton from './add-faculty-button'

vi.mock('@/lib/faculties/faculties.action', () => ({
  createFacultyAction: vi.fn(),
}))

describe('AddFacultyButton', () => {
  const label = 'Tambah baru'

  describe('Render', () => {
    it('should shows add button', () => {
      render(<AddFacultyButton label={label} />)

      expect(screen.getByRole('button', { name: label })).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should shows FacultForm when pressed', async () => {
      const { user } = render(<AddFacultyButton />)

      await user.click(screen.getByRole('button', { name: label }))

      expect(screen.getByRole('dialog')).toBeVisible()
      expect(screen.getByText(/tambah fakultas/i)).toBeVisible()
      expect(screen.getByTestId('FacultyForm')).toBeVisible()
    })

    it('allows interaction with FacultyForm', async () => {
      const { user } = render(<AddFacultyButton />)

      await user.click(screen.getByRole('button', { name: label }))

      const inputEl = screen.getByLabelText(/nama/i)
      await user.type(inputEl, 'name')
      expect(inputEl).toHaveValue('name')
    })
  })
})
