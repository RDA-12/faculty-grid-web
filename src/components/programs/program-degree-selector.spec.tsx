import { describe, expect, it } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import ProgramDegreeSelector from './program-degree-selector'
import { ProgramDegreeLevel } from '@/lib/programs/program.types'

describe('ProgramDegreeSelector', () => {
  const labels = ['S1 - Sarjana', 'S2 - Magister', 'S3 - Doktor']

  describe('Render', () => {
    it('should render the select and all its options', async () => {
      const { user } = render(<ProgramDegreeSelector />)

      const selectEl = screen.getByRole('combobox', { hidden: true })
      expect(selectEl).toBeVisible()

      await user.click(selectEl)

      for (let v of labels) {
        expect(screen.getByRole('option', { name: v })).toBeVisible()
      }
    })

    it('should render with controlled value', () => {
      render(<ProgramDegreeSelector value={ProgramDegreeLevel.master} />)

      expect(screen.getByText('S2 - Magister')).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should calls onValueChange when a degree is selected', async () => {
      let lastValue: ProgramDegreeLevel | undefined
      const { user } = render(
        <ProgramDegreeSelector
          onValueChange={(v) => {
            lastValue = v
          }}
        />,
      )

      const selectEl = screen.getByRole('combobox', { hidden: true })
      expect(selectEl).toBeVisible()

      await user.click(selectEl)
      await user.click(screen.getByRole('option', { name: labels[0] }))
      expect(lastValue).toBe(ProgramDegreeLevel.bachelor)

      await user.click(selectEl)
      await user.click(screen.getByRole('option', { name: labels[1] }))
      expect(lastValue).toBe(ProgramDegreeLevel.master)
    })
  })
})
