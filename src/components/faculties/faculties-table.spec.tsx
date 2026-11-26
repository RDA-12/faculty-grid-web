import { describe, expect, it, vi } from 'vitest'
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import FacultiesTable from './faculties-table'
import type { Faculty } from '@/lib/faculties/faculty.types'
import { deleteFacultyAction } from '@/lib/faculties/faculties.action'
import type { ActionState } from '@/lib/common/types'
import { internalError } from '../../../test/mock/http-response/common.response'

vi.mock('@/lib/faculties/faculties.action', () => ({
  deleteFacultyAction: vi.fn(),
}))
vi.mock('@/lib/faculties/faculties.query', () => ({
  getFacultiesQuery: vi.fn().mockResolvedValue({
    data: {
      data: [],
      pagination: {
        page: 1,
        pageSize: 10,
        total: 0,
      },
    },
  }),
}))

describe('FacultiesTable', () => {
  const faculties = Array.from({ length: 10 }, (_, index) => ({
    id: `${index}`,
    name: `faculty ${index}`,
  }))

  async function deleteFaculty(user: UserEvent, f: Faculty) {
    // open dropdown
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(f.name, 'i'),
      }),
    )
    // click delete
    await user.click(screen.getByRole('menuitem', { name: /hapus/i }))
    const dialogEl = screen.getByRole('alertdialog', {
      name: /hapus fakultas/i,
    })
    await waitFor(() => expect(dialogEl).toBeVisible())

    // click delete on dialog
    await user.click(within(dialogEl).getByRole('button', { name: /hapus/i }))
  }

  describe('Render', () => {
    it('should shows correct header', () => {
      render(<FacultiesTable faculties={faculties} />)

      expect(
        screen.getByRole('columnheader', { name: /nama fakultas/i }),
      ).toBeVisible()
      expect(screen.getByRole('columnheader', { name: /#/i })).toBeVisible()
    })

    it('should correct data', () => {
      render(<FacultiesTable faculties={faculties} />)

      for (var f of faculties) {
        const row = screen.getByRole('row', { name: new RegExp(f.name, 'i') })
        expect(row).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', { name: f.name }),
        ).toBeInTheDocument()
      }
    })

    it('should shows empty text when faculties is empty', () => {
      render(<FacultiesTable faculties={[]} />)

      expect(
        screen.getByText('Belum ada fakultas yang ditambahkan'),
      ).toBeVisible()
    })

    it('should shows each faculty actions', () => {
      render(<FacultiesTable faculties={faculties} />)

      for (var f of faculties) {
        expect(screen.getByRole('button', { name: new RegExp(f.name, 'i') }))
      }
    })
  })

  describe('Interactions', () => {
    it('should calls deleteFacultyAction when a faculty is deleted', async () => {
      const { user } = render(<FacultiesTable faculties={faculties} />)

      await deleteFaculty(user, faculties[0])

      await waitFor(() =>
        expect(deleteFacultyAction).toHaveBeenCalledExactlyOnceWith(
          faculties[0].id,
        ),
      )
    })
  })

  describe('Side Effects', () => {
    it('should shows loading toast when one of faculties is deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteFacultyAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<FacultiesTable faculties={faculties} />)

      await deleteFaculty(user, faculties[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${faculties[0].name}...`),
        ).toBeVisible(),
      )

      act(() => {
        resolve({ data: true })
      })

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).queryByText(`Menghapus ${faculties[0].name}...`),
        ).not.toBeInTheDocument(),
      )
    })

    it('should shows success toast when one of faculties is successfully deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteFacultyAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<FacultiesTable faculties={faculties} />)

      await deleteFaculty(user, faculties[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${faculties[0].name}...`),
        ).toBeVisible(),
      )

      act(() => {
        resolve({ data: true })
      })

      const toastEl = screen.getByRole('region', { name: /notifications/i })
      await waitFor(() =>
        expect(
          within(toastEl).getByText(`${faculties[0].name} berhasil dihapus`),
        ).toBeVisible(),
      )
    })

    it('should shows error toast when one of faculties is failed to be deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteFacultyAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<FacultiesTable faculties={faculties} />)

      await deleteFaculty(user, faculties[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${faculties[0].name}...`),
        ).toBeVisible(),
      )

      act(() => {
        resolve({
          error: {
            status: 500,
            ...internalError.error,
          },
        })
      })

      const toastEl = screen.getByRole('region', { name: /notifications/i })
      await waitFor(() =>
        expect(
          within(toastEl).getByText(internalError.error.title),
        ).toBeVisible(),
      )
      await waitFor(() =>
        expect(
          within(toastEl).getByText(internalError.error.detail),
        ).toBeVisible(),
      )
    })
  })
})
