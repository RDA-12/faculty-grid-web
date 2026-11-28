import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import AddProgramButton from './add-program-button'

vi.mock('@/lib/programs/programs.action', () => ({
  createProgramAction: vi.fn(),
}))

vi.mock('@/lib/faculties/faculties.hook', () => ({
  useFaculties: vi.fn().mockReturnValue({
    faculties: {
      data: [
        { id: 'faculty-1', name: 'Fakultas Ilmu Komputer' },
        { id: 'faculty-2', name: 'Fakultas Teknik' },
      ],
      pagination: { page: 1, pageSize: 5, total: 2 },
    },
  }),
}))

describe('AddProgramButton', () => {
  const label = 'Tambah baru'

  describe('Render', () => {
    it('should show add button', () => {
      render(<AddProgramButton label={label} />)

      expect(screen.getByRole('button', { name: label })).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should show ProgramForm when pressed', async () => {
      const { user } = render(<AddProgramButton />)

      await user.click(screen.getByRole('button', { name: label }))

      expect(screen.getByRole('dialog')).toBeVisible()
      expect(screen.getByText(/tambah program studi/i)).toBeVisible()
      expect(screen.getByTestId('ProgramForm')).toBeVisible()
    })

    it('allows interaction with ProgramForm', async () => {
      const { user } = render(<AddProgramButton />)

      await user.click(screen.getByRole('button', { name: label }))

      const comboboxEl = screen.getByRole('combobox', {
        name: 'Pilih fakultas',
      })
      await user.click(comboboxEl)
      await user.click(
        screen.getByRole('option', { name: 'Fakultas Ilmu Komputer' }),
      )
      expect(comboboxEl).toHaveValue('Fakultas Ilmu Komputer')
      expect(screen.getByRole('dialog')).toBeVisible()

      const inputEl = screen.getByLabelText(/nama program studi/i)
      await user.type(inputEl, 'Sistem Informasi')
      expect(inputEl).toHaveValue('Sistem Informasi')
    })
  })
})
