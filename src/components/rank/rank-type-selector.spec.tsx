import { describe, expect, it } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import RankTypeSelector from './rank-type-selector'
import { RankType } from '@/lib/rank/rank.types'

describe('RankTypeSelector', () => {
  const labels = ['ASN', 'Militer']

  describe('Render', () => {
    it('should render the select and all its options', async () => {
      const { user } = render(<RankTypeSelector />)

      const selectEl = screen.getByRole('combobox', { hidden: true })
      expect(selectEl).toBeVisible()

      await user.click(selectEl)

      for (const v of labels) {
        expect(screen.getByRole('option', { name: v })).toBeVisible()
      }
    })

    it('should render with controlled value', () => {
      render(<RankTypeSelector value={RankType.military} />)

      expect(screen.getByText('Militer')).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should calls onValueChange when a rank type is selected', async () => {
      let lastValue: RankType | undefined
      const { user } = render(
        <RankTypeSelector
          onValueChange={(v) => {
            lastValue = v
          }}
        />,
      )

      const selectEl = screen.getByRole('combobox', { hidden: true })
      expect(selectEl).toBeVisible()

      await user.click(selectEl)
      await user.click(screen.getByRole('option', { name: labels[0] }))
      expect(lastValue).toBe(RankType.asn)

      await user.click(selectEl)
      await user.click(screen.getByRole('option', { name: labels[1] }))
      expect(lastValue).toBe(RankType.military)
    })
  })
})
