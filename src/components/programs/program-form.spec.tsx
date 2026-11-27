import { describe, expect, it, vi } from 'vitest'
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import { createProgramAction } from '@/lib/programs/programs.action'
import type { ActionState } from '@/lib/common/types'
import { Program, ProgramDegreeLevel } from '@/lib/programs/program.types'
import ProgramForm from './program-form'
import type { CreateProgramRequest } from '@/lib/programs/programs.schema'
import type { Faculty } from '@/lib/faculties/faculty.types'

vi.mock('@/lib/programs/programs.action', () => ({
  createProgramAction: vi.fn(),
}))

const faculties: Faculty[] = [
  { id: 'faculty-1', name: 'Fakultas Ilmu Komputer' },
  { id: 'faculty-2', name: 'Fakultas Teknik' },
]

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

describe('ProgramForm', () => {
  async function clickSubmit(user: UserEvent) {
    await user.click(screen.getByRole('button', { name: /buat program/i }))
  }

  async function inputName(user: UserEvent, name: string) {
    const inputEl = screen.getByLabelText(/nama program studi/i)
    await user.type(inputEl, name)
    return inputEl
  }

  async function selectFaculty(user: UserEvent, facultyName: string) {
    const comboboxEl = screen.getByRole('combobox', { name: 'Pilih fakultas' })
    await user.click(comboboxEl)
    await user.click(screen.getByRole('option', { name: facultyName }))
  }

  async function selectDegree(user: UserEvent, degreeName: string) {
    const triggerEl = screen.getByRole('combobox', {
      name: '',
    })
    await user.click(triggerEl)
    await user.click(screen.getByRole('option', { name: degreeName }))
  }

  describe('Render', () => {
    it('should show faculty combobox', () => {
      render(<ProgramForm />)

      expect(
        screen.getByRole('combobox', { name: 'Pilih fakultas' }),
      ).toBeVisible()
    })

    it('should show degree level selector', () => {
      render(<ProgramForm />)

      expect(screen.getByText('Pilih tingkat pendidikan')).toBeVisible()
    })

    it('should show name field', () => {
      render(<ProgramForm />)

      expect(screen.getByLabelText(/nama program studi/i)).toBeVisible()
      expect(screen.getByPlaceholderText(/sistem informasi/i)).toBeVisible()
    })

    it('should show save button', () => {
      render(<ProgramForm />)

      expect(
        screen.getByRole('button', { name: /buat program/i }),
      ).toBeVisible()
    })

    it('should disable save button and show spinner when pending', async () => {
      let resolveAction!: (v: ActionState<unknown, Program>) => void
      vi.mocked(createProgramAction).mockImplementation(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(<ProgramForm />)

      await selectFaculty(user, faculties[0].name)
      await selectDegree(user, 'S1 - Sarjana')
      await inputName(user, 'Sistem Informasi')
      await clickSubmit(user)

      expect(
        screen.getByRole('button', { name: /buat program/i }),
      ).toBeDisabled()
      expect(screen.getByRole('status')).toBeVisible()

      await act(async () => {
        resolveAction({
          data: {
            id: 'id',
            name: 'Sistem Informasi',
            degreeLevel: ProgramDegreeLevel.bachelor,
            facultyId: 'faculty-1',
          },
        })
      })

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /buat program/i }),
        ).not.toBeDisabled(),
      )
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should show error when submit with invalid form', async () => {
      vi.mocked(createProgramAction).mockResolvedValue({
        errors: {
          name: 'Wajib diisi',
          facultyId: 'Wajib diisi',
          degreeLevel: 'Wajib diisi',
        },
      })

      const { user } = render(<ProgramForm />)

      await clickSubmit(user)

      const errorMessages = screen.getAllByText('Wajib diisi')
      expect(errorMessages.length).toBeGreaterThan(0)
    })

    it('should show error toast when createProgramAction is failed', async () => {
      vi.mocked(createProgramAction).mockResolvedValue({
        error: {
          status: 401,
          title: 'Error title',
          detail: 'Error detail',
        },
      })

      const { user } = render(<ProgramForm />)

      await selectFaculty(user, faculties[0].name)
      await selectDegree(user, 'S1 - Sarjana')
      await inputName(user, 'Sistem Informasi')
      await clickSubmit(user)

      const regionEL = screen.getByRole('region', { name: /notifications/i })
      await waitFor(() =>
        expect(within(regionEL).getByText('Error title')).toBeVisible(),
      )
      await waitFor(() =>
        expect(within(regionEL).getByText('Error detail')).toBeVisible(),
      )
    })

    it('should show success toast when createProgramAction is success', async () => {
      vi.mocked(createProgramAction).mockResolvedValue({
        data: {
          id: 'id',
          name: 'Sistem Informasi',
          degreeLevel: ProgramDegreeLevel.bachelor,
          facultyId: 'faculty-1',
        },
      })

      const { user } = render(<ProgramForm />)

      await selectFaculty(user, faculties[0].name)
      await selectDegree(user, 'S1 - Sarjana')
      await inputName(user, 'Sistem Informasi')
      await clickSubmit(user)

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText('Sistem Informasi berhasil dibuat'),
        ).toBeVisible(),
      )
    })
  })

  describe('Interactions', () => {
    it('allows inputting name', async () => {
      const { user } = render(<ProgramForm />)

      const nameInputEl = await inputName(user, 'Teknik Informatika')

      expect(nameInputEl).toHaveValue('Teknik Informatika')
    })

    it('allows selecting faculty', async () => {
      const { user } = render(<ProgramForm />)

      await selectFaculty(user, faculties[0].name)

      const comboboxEl = screen.getByRole('combobox', {
        name: 'Pilih fakultas',
      })
      expect(comboboxEl).toHaveValue(faculties[0].name)
    })

    it('allows selecting degree level', async () => {
      const { user } = render(<ProgramForm />)

      await selectDegree(user, 'S2 - Magister')

      const values = screen.getAllByText('S2 - Magister')
      expect(values.length).toBeGreaterThan(0)
    })

    it('should call createProgramAction with correct data', async () => {
      const { user } = render(<ProgramForm />)

      await selectFaculty(user, faculties[0].name)
      await selectDegree(user, 'S1 - Sarjana')
      await inputName(user, 'Sistem Informasi')
      await clickSubmit(user)

      const expectedArgs: CreateProgramRequest = {
        name: 'Sistem Informasi',
        facultyId: 'faculty-1',
        degreeLevel: ProgramDegreeLevel.bachelor,
      }
      expect(createProgramAction).toHaveBeenCalledExactlyOnceWith(expectedArgs)
    })
  })
})
