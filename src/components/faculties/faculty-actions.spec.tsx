import { describe, expect, it, vi } from 'vitest'
import { render, screen, type UserEvent } from '../../../test/rtl-helper'
import FacultyActions from './faculty-actions'
import type { Faculty } from '@/lib/faculties/faculty.types'

vi.mock('@/lib/faculties/faculties.action', () => ({
  deleteFacultyAction: vi.fn(),
}))

describe('FacultyActions', () => {
  const faculty: Faculty = {
    id: 'id',
    name: 'faculty name',
  }

  async function openDropdown(user: UserEvent) {
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`Aksi ${faculty.name}`, 'i'),
      }),
    )
  }

  describe('Render', () => {
    it('should shows correct trigger', () => {
      render(<FacultyActions faculty={faculty} />)

      expect(
        screen.getByRole('button', {
          name: new RegExp(`Aksi ${faculty.name}`, 'i'),
        }),
      ).toBeVisible()
      expect(screen.getByTestId('moreIcon')).toBeVisible()
    })

    it('should shows see detail item when opened', async () => {
      const { user } = render(<FacultyActions faculty={faculty} />)

      await openDropdown(user)

      expect(
        screen.getByRole('menuitem', { name: /lihat detail/i }),
      ).toBeVisible()
    })

    it('should shows update item when opened', async () => {
      const { user } = render(<FacultyActions faculty={faculty} />)

      await openDropdown(user)

      expect(
        screen.getByRole('menuitem', { name: /update cepat/i }),
      ).toBeVisible()
    })

    it('should shows delete item when opened', async () => {
      const { user } = render(<FacultyActions faculty={faculty} />)

      await openDropdown(user)

      expect(screen.getByRole('menuitem', { name: /hapus/i })).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should open delete faculty dialog when delete item pressed', async () => {
      const { user } = render(<FacultyActions faculty={faculty} />)

      await openDropdown(user)

      await user.click(screen.getByRole('menuitem', { name: /hapus/i }))

      expect(
        screen.getByRole('alertdialog', {
          name: /hapus fakultas?/i,
        }),
      ).toBeVisible()
    })
  })
})
