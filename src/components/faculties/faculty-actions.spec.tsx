import { describe, expect, it, vi } from 'vitest'
import {
  render,
  screen,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import FacultyActions from './faculty-actions'
import type { Faculty } from '@/lib/faculties/faculty.types'
import { useDeleteFaculty } from '@/lib/faculties/faculties.hook'

vi.mock('@/lib/faculties/faculties.action', () => ({
  deleteFacultyAction: vi.fn(),
}))
vi.mock('@/lib/faculties/faculties.hook', () => ({
  useDeleteFaculty: vi.fn().mockImplementation(() => ({
    pendingDeletion: [],
  })),
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

      const detailItem = screen.getByRole('menuitem', {
        name: new RegExp(`lihat detail ${faculty.name}`, 'i'),
      })
      expect(detailItem).toBeVisible()
      expect(detailItem).toHaveAttribute(
        'href',
        `/dashboard/faculties/${faculty.id}`,
      )
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

    it('should disabled and shows placeholder when the faculty is in pendingDeletion list of useDeleteFaculty', async () => {
      vi.mocked(useDeleteFaculty).mockImplementationOnce(
        () =>
          ({
            pendingDeletion: [faculty],
          }) as unknown as ReturnType<typeof useDeleteFaculty>,
      )
      render(<FacultyActions faculty={faculty} />)

      expect(
        screen.getByRole('button', {
          name: new RegExp(`Aksi ${faculty.name}`, 'i'),
        }),
      ).toBeDisabled()
      expect(
        within(
          screen.getByRole('button', {
            name: new RegExp(`Aksi ${faculty.name}`, 'i'),
          }),
        ).getByText(/menghapus/i),
      ).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should calls onDeleteClicked when delete item pressed', async () => {
      let pressed = false
      const { user } = render(
        <FacultyActions
          faculty={faculty}
          onDeleteClicked={() => {
            pressed = true
          }}
        />,
      )

      await openDropdown(user)

      await user.click(screen.getByRole('menuitem', { name: /hapus/i }))

      expect(pressed).toBeTruthy()
    })
  })
})
