import { describe, expect, it, vi } from 'vitest'
import {
  render,
  screen,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import RankActions from './rank-actions'
import { RankType, type Rank } from '@/lib/rank/rank.types'
import { useDeleteRank } from '@/lib/rank/rank.hook'

vi.mock('@/lib/rank/rank.action', () => ({
  deleteRankAction: vi.fn(),
}))
vi.mock('@/lib/rank/rank.hook', () => ({
  useDeleteRank: vi.fn().mockImplementation(() => ({
    pendingDeletion: [],
  })),
}))

describe('RankActions', () => {
  const rank: Rank = {
    id: 'id',
    name: 'Penata Muda (III/a)',
    type: RankType.asn,
  }

  async function openDropdown(user: UserEvent) {
    await user.click(
      screen.getByRole('button', {
        name: `Aksi ${rank.name}`,
      }),
    )
  }

  describe('Render', () => {
    it('should shows correct trigger', () => {
      render(<RankActions rank={rank} />)

      expect(
        screen.getByRole('button', {
          name: `Aksi ${rank.name}`,
        }),
      ).toBeVisible()
      expect(screen.getByTestId('moreIcon')).toBeVisible()
    })

    it('should shows see detail item when opened', async () => {
      const { user } = render(<RankActions rank={rank} />)

      await openDropdown(user)

      const detailItem = screen.getByRole('menuitem', {
        name: `Lihat detail ${rank.name}`,
      })
      expect(detailItem).toBeVisible()
      expect(detailItem).toHaveAttribute('href', `/dashboard/ranks/${rank.id}`)
    })

    it('should shows update item when opened', async () => {
      const { user } = render(<RankActions rank={rank} />)

      await openDropdown(user)

      expect(
        screen.getByRole('menuitem', { name: /update cepat/i }),
      ).toBeVisible()
    })

    it('should shows delete item when opened', async () => {
      const { user } = render(<RankActions rank={rank} />)

      await openDropdown(user)

      expect(screen.getByRole('menuitem', { name: /hapus/i })).toBeVisible()
    })

    it('should disabled and shows placeholder when the rank is in pendingDeletion list of useDeleteRank', async () => {
      vi.mocked(useDeleteRank).mockImplementationOnce(
        () =>
          ({
            pendingDeletion: [rank],
          }) as unknown as ReturnType<typeof useDeleteRank>,
      )
      render(<RankActions rank={rank} />)

      const triggerEl = screen.getByRole('button', {
        name: `Aksi ${rank.name}`,
      })
      expect(triggerEl).toBeDisabled()
      expect(within(triggerEl).getByText(/menghapus/i)).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should calls onDeleteClicked when delete item pressed', async () => {
      let pressed = false
      const { user } = render(
        <RankActions
          rank={rank}
          onDeleteClicked={() => {
            pressed = true
          }}
        />,
      )

      await openDropdown(user)

      await user.click(screen.getByRole('menuitem', { name: /hapus/i }))

      expect(pressed).toBeTruthy()
    })
  })
})
