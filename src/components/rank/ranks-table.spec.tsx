import { describe, expect, it } from 'vitest'
import { render, screen, within } from '../../../test/rtl-helper'
import RanksTable from './ranks-table'
import { RankType, type Rank } from '@/lib/rank/rank.types'

const RANK_TYPE_LABELS: Record<RankType, string> = {
  [RankType.asn]: 'ASN',
  [RankType.military]: 'Militer',
}

describe('RanksTable', () => {
  const rankTypes = [RankType.asn, RankType.military]
  const ranks: Rank[] = Array.from({ length: 10 }, (_, index) => ({
    id: `${index}`,
    name: `rank ${index}`,
    type: rankTypes[index % rankTypes.length],
  }))

  describe('Render', () => {
    it('should shows correct header', () => {
      render(<RanksTable ranks={ranks} />)

      expect(
        screen.getByRole('columnheader', { name: /nama pangkat\/golongan/i }),
      ).toBeVisible()
      expect(
        screen.getByRole('columnheader', { name: /jenis pangkat\/golongan/i }),
      ).toBeVisible()
      expect(screen.getByRole('columnheader', { name: /#/i })).toBeVisible()
    })

    it('should shows correct data', () => {
      render(<RanksTable ranks={ranks} />)

      for (const r of ranks) {
        const row = screen.getByRole('row', { name: new RegExp(r.name, 'i') })
        expect(row).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', { name: r.name }),
        ).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', {
            name: RANK_TYPE_LABELS[r.type],
          }),
        ).toBeInTheDocument()
      }
    })

    it('should shows empty text when ranks is empty', () => {
      render(<RanksTable ranks={[]} />)

      expect(
        screen.getByText('Belum ada pangkat/golongan yang ditambahkan'),
      ).toBeVisible()
    })
  })
})
