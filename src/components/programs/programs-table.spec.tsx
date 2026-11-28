import { describe, expect, it, vi } from 'vitest'
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import ProgramsTable from './programs-table'
import { ProgramDegreeLevel, type Program } from '@/lib/programs/program.types'
import { deleteProgramAction } from '@/lib/programs/programs.action'
import type { ActionState } from '@/lib/common/types'
import { internalError } from '../../../test/mock/http-response/common.response'

vi.mock('@/lib/programs/programs.action', () => ({
  deleteProgramAction: vi.fn(),
}))

const DEGREE_LEVEL_LABELS: Record<ProgramDegreeLevel, string> = {
  [ProgramDegreeLevel.bachelor]: 'S1 - Sarjana',
  [ProgramDegreeLevel.master]: 'S2 - Magister',
  [ProgramDegreeLevel.doctorate]: 'S3 - Doktor',
}

describe('ProgramsTable', () => {
  const degreeLevels = [
    ProgramDegreeLevel.bachelor,
    ProgramDegreeLevel.master,
    ProgramDegreeLevel.doctorate,
  ]
  const programs: Program[] = Array.from({ length: 10 }, (_, index) => ({
    id: `${index}`,
    name: `program ${index}`,
    degreeLevel: degreeLevels[index % degreeLevels.length],
    facultyId: `faculty-id-${index}`,
  }))

  async function deleteProgram(user: UserEvent, p: Program) {
    // open dropdown
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(p.name, 'i'),
      }),
    )
    // click delete
    await user.click(screen.getByRole('menuitem', { name: /hapus/i }))
    const dialogEl = screen.getByRole('alertdialog', {
      name: /hapus program studi/i,
    })
    await waitFor(() => expect(dialogEl).toBeVisible())

    // click delete on dialog
    await user.click(within(dialogEl).getByRole('button', { name: /hapus/i }))
  }

  describe('Render', () => {
    it('should shows correct header', () => {
      render(<ProgramsTable programs={programs} />)

      expect(
        screen.getByRole('columnheader', { name: /nama program studi/i }),
      ).toBeVisible()
      expect(
        screen.getByRole('columnheader', { name: /tingkat pendidikan/i }),
      ).toBeVisible()
      expect(screen.getByRole('columnheader', { name: /#/i })).toBeVisible()
    })

    it('should shows correct data without facultyId', () => {
      render(<ProgramsTable programs={programs} />)

      for (const p of programs) {
        const row = screen.getByRole('row', { name: new RegExp(p.name, 'i') })
        expect(row).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', { name: p.name }),
        ).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', {
            name: DEGREE_LEVEL_LABELS[p.degreeLevel],
          }),
        ).toBeInTheDocument()
        expect(screen.queryByText(p.facultyId)).not.toBeInTheDocument()
      }
    })

    it('should shows empty text when programs is empty', () => {
      render(<ProgramsTable programs={[]} />)

      expect(
        screen.getByText('Belum ada program studi yang ditambahkan'),
      ).toBeVisible()
    })

    it('should shows each program actions', () => {
      render(<ProgramsTable programs={programs} />)

      for (const p of programs) {
        expect(
          screen.getByRole('button', { name: new RegExp(p.name, 'i') }),
        ).toBeVisible()
      }
    })
  })

  describe('Interactions', () => {
    it('should calls deleteProgramAction when a program is deleted', async () => {
      const { user } = render(<ProgramsTable programs={programs} />)

      await deleteProgram(user, programs[0])

      await waitFor(() =>
        expect(deleteProgramAction).toHaveBeenCalledExactlyOnceWith(
          programs[0].id,
        ),
      )
    })
  })

  describe('Side Effects', () => {
    it('should shows loading toast when one of programs is deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteProgramAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<ProgramsTable programs={programs} />)

      await deleteProgram(user, programs[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${programs[0].name}...`),
        ).toBeVisible(),
      )

      act(() => {
        resolve({ data: true })
      })

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).queryByText(`Menghapus ${programs[0].name}...`),
        ).not.toBeInTheDocument(),
      )
    })

    it('should shows success toast when one of programs is successfully deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteProgramAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<ProgramsTable programs={programs} />)

      await deleteProgram(user, programs[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${programs[0].name}...`),
        ).toBeVisible(),
      )

      act(() => {
        resolve({ data: true })
      })

      const toastEl = screen.getByRole('region', { name: /notifications/i })
      await waitFor(() =>
        expect(
          within(toastEl).getByText(`${programs[0].name} berhasil dihapus`),
        ).toBeVisible(),
      )
    })

    it('should shows error toast when one of programs is failed to be deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteProgramAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<ProgramsTable programs={programs} />)

      await deleteProgram(user, programs[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${programs[0].name}...`),
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
