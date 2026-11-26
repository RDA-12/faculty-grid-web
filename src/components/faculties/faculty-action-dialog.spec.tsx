import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen } from '../../../test/rtl-helper'
import {
  FacultyActionDeleteDialog,
  useFacultyDeleteDialog,
  type FacultyActionDeleteDialogController,
} from './faculty-action-dialog'
import type { Faculty } from '@/lib/faculties/faculty.types'

describe('useFacultyDeleteDialog', () => {
  const faculty: Faculty = {
    id: 'id',
    name: 'name',
  }

  it('should set faculty and isOpen when open is called', () => {
    const { result } = renderHook(() => useFacultyDeleteDialog())

    act(() => {
      result.current.open(faculty)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.faculty).toStrictEqual(faculty)
  })

  it('should set faculty to null and isOpen to false when close is called', () => {
    const { result } = renderHook(() => useFacultyDeleteDialog())

    act(() => {
      result.current.open(faculty)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.faculty).toStrictEqual(faculty)

    act(() => {
      result.current.close(false)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.faculty).toBeNull()
  })

  it('should calls onDeleted when it close with onDeleted provided', () => {
    let deleted: Faculty | undefined
    const { result } = renderHook(() =>
      useFacultyDeleteDialog({
        onDeleted(f) {
          deleted = f
        },
      }),
    )

    act(() => {
      result.current.open(faculty)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.faculty).toStrictEqual(faculty)

    act(() => {
      result.current.close(true)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.faculty).toBeNull()
    expect(deleted).toStrictEqual(faculty)
  })
})

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

      it('should not render dialog when closed', async () => {
        render(
          <FacultyActionDeleteDialog
            controller={{ ...controller, isOpen: false }}
          />,
        )

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
    })

    describe('Interactions', () => {
      it('should call close on controller when cancel button is pressed', async () => {
        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /batalkan/i }))
        expect(controller.close).toHaveBeenCalledOnce()
      })

      it('should call close on controller when delete button is pressed', async () => {
        const { user } = render(
          <FacultyActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /hapus/i }))
        expect(controller.close).toHaveBeenCalledOnce()
      })
    })
  })
})
