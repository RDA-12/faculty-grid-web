import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen, waitFor, within } from '../../../test/rtl-helper'
import {
  FacultyActionDeleteDialog,
  type FacultyActionDeleteDialogController,
} from './faculty-action-dialog'
import type { Faculty } from '@/lib/faculties/faculty.types'
import { deleteFacultyAction } from '@/lib/faculties/faculties.action'
import type { ActionState } from '@/lib/common/types'
import { internalError } from '../../../test/mock/http-response/common.response'
import { useFaculties } from '@/lib/faculties/faculties.hook'

vi.mock('@/lib/faculties/faculties.action', () => ({
  deleteFacultyAction: vi.fn().mockResolvedValue({
    data: true,
  }),
}))
vi.mock('@/lib/faculties/faculties.hook', () => ({
  useFaculties: vi.fn().mockReturnValue({
    getFaculties: vi.fn(),
  }),
}))

describe('FacultyActionDialog', () => {
  const faculty: Faculty = {
    id: 'id',
    name: 'name',
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('FacultyActionDeleteDialog', () => {
    const controller: FacultyActionDeleteDialogController = {
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      faculty: faculty,
    }

    beforeEach(() => {
      vi.clearAllMocks()
    })

    describe('Render', () => {
      it('should shows correct title', () => {
        render(<FacultyActionDeleteDialog controller={controller} />)

        expect(
          screen.getByRole('heading', { level: 2, name: /hapus fakultas/i }),
        ).toBeVisible()
      })

      it('should shows correct descripton', () => {
        render(<FacultyActionDeleteDialog controller={controller} />)

        expect(
          screen.getByText(
            `Seluruh data ${faculty.name} akun dipindahkan ke sampah, termasuk seluruh data yang berhubang dengan fakultas ini, seperti program studi, mata kuliah, dan dosen.`,
          ),
        ).toBeVisible()
      })

      it('should shows cancel button', () => {
        render(<FacultyActionDeleteDialog controller={controller} />)

        expect(screen.getByRole('button', { name: /batalkan/i })).toBeVisible()
      })

      it('should shows delete button', () => {
        render(<FacultyActionDeleteDialog controller={controller} />)

        expect(screen.getByRole('button', { name: /hapus/i })).toBeVisible()
      })
    })

    describe('Interactions', () => {
      it('should call close on controller without calling deleteFacultyAction when cancel button is pressed', async () => {
        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /batalkan/i }))
        expect(controller.close).toHaveBeenCalledOnce()
        expect(deleteFacultyAction).not.toHaveBeenCalled()
      })

      it('should call close on controller with calling deleteFacultyAction when cancel button is pressed', async () => {
        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /hapus/i }))
        expect(controller.close).toHaveBeenCalledOnce()
        expect(deleteFacultyAction).toHaveBeenCalledExactlyOnceWith(
          {},
          faculty.id,
        )
      })
    })

    describe('Side Effects', () => {
      it('shows loading toast when starting delete faculty process', async () => {
        let resolve!: (v: ActionState<string, boolean>) => void
        vi.mocked(deleteFacultyAction).mockImplementationOnce(
          () =>
            new Promise((r) => {
              resolve = r
            }),
        )

        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        await user.click(screen.getByRole('button', { name: /hapus/i }))

        expect(
          screen.getByRole('region', { name: /notifications/i }),
        ).toBeVisible()
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${faculty.name}...`),
        ).toBeVisible()

        await act(async () => {
          resolve({ data: true })
        })
      })

      it('shows success toast when delete faculty success', async () => {
        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        await user.click(screen.getByRole('button', { name: /hapus/i }))

        expect(
          screen.getByRole('region', { name: /notifications/i }),
        ).toBeVisible()
        await waitFor(() =>
          expect(
            within(
              screen.getByRole('region', { name: /notifications/i }),
            ).getByText(`${faculty.name} berhasil dihapus`),
          ).toBeVisible(),
        )
      })

      it('shows error toast when delete faculty failed', async () => {
        vi.mocked(deleteFacultyAction).mockResolvedValueOnce({
          error: {
            status: 500,
            ...internalError.error,
          },
        })

        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        await user.click(screen.getByRole('button', { name: /hapus/i }))

        expect(
          screen.getByRole('region', { name: /notifications/i }),
        ).toBeVisible()
        await waitFor(() => {
          expect(
            within(
              screen.getByRole('region', { name: /notifications/i }),
            ).getByText(`${internalError.error.title}`),
          ).toBeVisible()
          expect(
            within(
              screen.getByRole('region', { name: /notifications/i }),
            ).getByText(`${internalError.error.detail}`),
          ).toBeVisible()
        })
      })

      it('should calls getfaculties when delete faculty success', async () => {
        const getFacultiesMock = vi.fn().mockResolvedValue({})
        vi.mocked(useFaculties).mockReturnValue({
          getFaculties: getFacultiesMock,
        } as unknown as ReturnType<typeof useFaculties>)

        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        await user.click(screen.getByRole('button', { name: /hapus/i }))

        await waitFor(() => expect(getFacultiesMock).toHaveBeenCalledOnce())
      })
    })
  })
})
