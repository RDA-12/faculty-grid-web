import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen } from '../../../test/rtl-helper'
import {
  ProgramActionDeleteDialog,
  useProgramDeleteDialog,
  type ProgramActionDeleteDialogController,
} from './program-action-dialog'
import { ProgramDegreeLevel, type Program } from '@/lib/programs/program.types'

describe('useProgramDeleteDialog', () => {
  const program: Program = {
    id: 'id',
    name: 'Sistem Informasi',
    degreeLevel: ProgramDegreeLevel.bachelor,
    facultyId: 'faculty-id',
  }

  it('should set program and isOpen when open is called', () => {
    const { result } = renderHook(() => useProgramDeleteDialog())

    act(() => {
      result.current.open(program)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.program).toStrictEqual(program)
  })

  it('should set program to null and isOpen to false when close is called', () => {
    const { result } = renderHook(() => useProgramDeleteDialog())

    act(() => {
      result.current.open(program)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.program).toStrictEqual(program)

    act(() => {
      result.current.close(false)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.program).toBeNull()
  })

  it('should calls onDeleted when it close with onDeleted provided', () => {
    let deleted: Program | undefined
    const { result } = renderHook(() =>
      useProgramDeleteDialog({
        onDeleted(p) {
          deleted = p
        },
      }),
    )

    act(() => {
      result.current.open(program)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.program).toStrictEqual(program)

    act(() => {
      result.current.close(true)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.program).toBeNull()
    expect(deleted).toStrictEqual(program)
  })
})

describe('ProgramActionDialog', () => {
  const program: Program = {
    id: 'id',
    name: 'Sistem Informasi',
    degreeLevel: ProgramDegreeLevel.bachelor,
    facultyId: 'faculty-id',
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('ProgramActionDeleteDialog', () => {
    const controller: ProgramActionDeleteDialogController = {
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      program: program,
    }

    describe('Render', () => {
      it('should shows correct title', () => {
        render(<ProgramActionDeleteDialog controller={controller} />)

        expect(
          screen.getByRole('heading', {
            level: 2,
            name: /hapus program studi/i,
          }),
        ).toBeVisible()
      })

      it('should shows correct description', () => {
        render(<ProgramActionDeleteDialog controller={controller} />)

        expect(
          screen.getByText(
            `Seluruh data ${program.name} akan dipindahkan ke sampah, termasuk seluruh data yang berhubungan dengan program studi ini.`,
          ),
        ).toBeVisible()
      })

      it('should shows cancel button', () => {
        render(<ProgramActionDeleteDialog controller={controller} />)

        expect(screen.getByRole('button', { name: /batalkan/i })).toBeVisible()
      })

      it('should shows delete button', () => {
        render(<ProgramActionDeleteDialog controller={controller} />)

        expect(screen.getByRole('button', { name: /hapus/i })).toBeVisible()
      })

      it('should not render dialog when closed', async () => {
        render(
          <ProgramActionDeleteDialog
            controller={{ ...controller, isOpen: false }}
          />,
        )

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
    })

    describe('Interactions', () => {
      it('should call close on controller when cancel button is pressed', async () => {
        const { user } = render(
          <ProgramActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /batalkan/i }))
        expect(controller.close).toHaveBeenCalledOnce()
      })

      it('should call close on controller when delete button is pressed', async () => {
        const { user } = render(
          <ProgramActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /hapus/i }))
        expect(controller.close).toHaveBeenCalledOnce()
      })
    })
  })
})
