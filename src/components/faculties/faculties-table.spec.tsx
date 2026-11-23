import { describe, expect, it } from 'vitest'
import { render, screen, within } from '../../../test/rtl-helper'
import FacultiesTable from './faculties-table'

describe('FacultiesTable', () => {
  const faculties = Array.from({ length: 10 }, (_, index) => ({
    id: `${index}`,
    name: `faculty ${index}`,
  }))

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
  })
})
