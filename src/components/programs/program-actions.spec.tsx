import { describe, expect, it, vi } from 'vitest'
import {
  render,
  screen,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import ProgramActions from './program-actions'
import { ProgramDegreeLevel, type Program } from '@/lib/programs/program.types'
import { useDeleteProgram } from '@/lib/programs/programs.hook'

vi.mock('@/lib/programs/programs.action', () => ({
  deleteProgramAction: vi.fn(),
}))
vi.mock('@/lib/programs/programs.hook', () => ({
  useDeleteProgram: vi.fn().mockImplementation(() => ({
    pendingDeletion: [],
  })),
}))

describe('ProgramActions', () => {
  const program: Program = {
    id: 'id',
    name: 'program name',
    degreeLevel: ProgramDegreeLevel.bachelor,
    facultyId: 'faculty-id',
  }

  async function openDropdown(user: UserEvent) {
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`Aksi ${program.name}`, 'i'),
      }),
    )
  }

  describe('Render', () => {
    it('should shows correct trigger', () => {
      render(<ProgramActions program={program} />)

      expect(
        screen.getByRole('button', {
          name: new RegExp(`Aksi ${program.name}`, 'i'),
        }),
      ).toBeVisible()
      expect(screen.getByTestId('moreIcon')).toBeVisible()
    })

    it('should shows see detail item when opened', async () => {
      const { user } = render(<ProgramActions program={program} />)

      await openDropdown(user)

      const detailItem = screen.getByRole('menuitem', {
        name: new RegExp(`lihat detail ${program.name}`, 'i'),
      })
      expect(detailItem).toBeVisible()
      expect(detailItem).toHaveAttribute(
        'href',
        `/dashboard/programs/${program.id}`,
      )
    })

    it('should shows update item when opened', async () => {
      const { user } = render(<ProgramActions program={program} />)

      await openDropdown(user)

      expect(
        screen.getByRole('menuitem', { name: /update cepat/i }),
      ).toBeVisible()
    })

    it('should shows delete item when opened', async () => {
      const { user } = render(<ProgramActions program={program} />)

      await openDropdown(user)

      expect(screen.getByRole('menuitem', { name: /hapus/i })).toBeVisible()
    })

    it('should disabled and shows placeholder when the program is in pendingDeletion list of useDeleteProgram', async () => {
      vi.mocked(useDeleteProgram).mockImplementationOnce(
        () =>
          ({
            pendingDeletion: [program],
          }) as unknown as ReturnType<typeof useDeleteProgram>,
      )
      render(<ProgramActions program={program} />)

      expect(
        screen.getByRole('button', {
          name: new RegExp(`Aksi ${program.name}`, 'i'),
        }),
      ).toBeDisabled()
      expect(
        within(
          screen.getByRole('button', {
            name: new RegExp(`Aksi ${program.name}`, 'i'),
          }),
        ).getByText(/menghapus/i),
      ).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should calls onDeleteClicked when delete item pressed', async () => {
      let pressed = false
      const { user } = render(
        <ProgramActions
          program={program}
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
