import { useFaculties } from '@/lib/faculties/faculties.hook'
import type { Faculty } from '@/lib/faculties/faculty.types'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '../../../test/rtl-helper'
import FacultiesCombobox from './faculties-combobox'

vi.mock('@/lib/faculties/faculties.hook', () => ({
  useFaculties: vi.fn(),
}))

describe('FacultiesCombobox', () => {
  const faculties: Faculty[] = Array.from({ length: 5 }, (_, index) => ({
    id: `${index}`,
    name: `Faculty ${index}`,
  }))
  const useFacultiesMock = vi.fn().mockReturnValue({
    faculties: {
      data: faculties,
      pagination: {
        page: 1,
        pageSize: 5,
        total: 5,
      },
    },
  })

  beforeEach(() => {
    vi.mocked(useFaculties).mockImplementation(useFacultiesMock)
  })

  describe('Render', () => {
    it('should shows combobox input', () => {
      render(<FacultiesCombobox />)

      expect(
        screen.getByRole('combobox', { name: 'Pilih fakultas' }),
      ).toBeVisible()
    })

    it('should shows selected value in combobox input', async () => {
      const { user } = render(<FacultiesCombobox />)

      const comboboxEl = screen.getByRole('combobox', {
        name: 'Pilih fakultas',
      })
      expect(comboboxEl).toBeVisible()

      await user.click(comboboxEl)
      await user.click(screen.getByRole('option', { name: faculties[0].name }))

      await waitFor(() => expect(comboboxEl).toHaveValue(faculties[0].name))
    })

    it('should show controlled value when provided', () => {
      render(<FacultiesCombobox value={faculties[2]} />)

      const comboboxEl = screen.getByRole('combobox', {
        name: 'Pilih fakultas',
      })
      expect(comboboxEl).toHaveValue(faculties[2].name)
    })
  })

  describe('Interactions', () => {
    it('should calls useFaculties with correct search', async () => {
      const { user } = render(<FacultiesCombobox />)

      const comboboxEl = screen.getByRole('combobox', {
        name: 'Pilih fakultas',
      })

      await user.type(comboboxEl, 'search')

      await waitFor(() =>
        expect(useFacultiesMock).toHaveBeenLastCalledWith(undefined, {
          search: 'search',
        }),
      )
    })

    it('should calls onValueChange when selected faculty is changed', async () => {
      let changedFaculty: Faculty | null | undefined
      const { user } = render(
        <FacultiesCombobox
          onValueChange={(f) => {
            changedFaculty = f
          }}
        />,
      )

      const comboboxEl = screen.getByRole('combobox', {
        name: 'Pilih fakultas',
      })
      await user.click(comboboxEl)

      await user.click(screen.getByRole('option', { name: faculties[0].name }))
      await waitFor(() => expect(changedFaculty).toStrictEqual(faculties[0]))

      await user.click(comboboxEl)
      await user.click(screen.getByRole('option', { name: faculties[1].name }))
      await waitFor(() => expect(changedFaculty).toStrictEqual(faculties[1]))

      await user.click(screen.getByRole('button', { name: /clear/i }))
      await waitFor(() => expect(changedFaculty).toBeNull())
    })
  })
})
