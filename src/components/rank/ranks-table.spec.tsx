import { describe, expect, it, vi } from 'vitest'
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import RanksTable from './ranks-table'
import { RankType, type Rank } from '@/lib/rank/rank.types'
import { deleteRankAction } from '@/lib/rank/rank.action'
import type { ActionState } from '@/lib/common/types'
import { internalError } from '../../../test/mock/http-response/common.response'

vi.mock('@/lib/rank/rank.action', () => ({
  deleteRankAction: vi.fn(),
}))

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

  async function deleteRank(user: UserEvent, r: Rank) {
    // open dropdown
    await user.click(
      screen.getByRole('button', {
        name: new RegExp(r.name, 'i'),
      }),
    )
    // click delete
    await user.click(screen.getByRole('menuitem', { name: /hapus/i }))
    const dialogEl = screen.getByRole('alertdialog', {
      name: /hapus pangkat\/golongan/i,
    })
    await waitFor(() => expect(dialogEl).toBeVisible())

    // click delete on dialog
    await user.click(within(dialogEl).getByRole('button', { name: /hapus/i }))
  }

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

    it('should shows each rank actions', () => {
      render(<RanksTable ranks={ranks} />)

      for (const r of ranks) {
        expect(
          screen.getByRole('button', { name: new RegExp(r.name, 'i') }),
        ).toBeVisible()
      }
    })
  })

  describe('Interactions', () => {
    it('should calls deleteRankAction when a rank is deleted', async () => {
      const { user } = render(<RanksTable ranks={ranks} />)

      await deleteRank(user, ranks[0])

      await waitFor(() =>
        expect(deleteRankAction).toHaveBeenCalledExactlyOnceWith(ranks[0].id),
      )
    })
  })

  describe('Side Effects', () => {
    it('should shows loading toast when one of ranks is deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteRankAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<RanksTable ranks={ranks} />)

      await deleteRank(user, ranks[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${ranks[0].name}...`),
        ).toBeVisible(),
      )

      act(() => {
        resolve({ data: true })
      })

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).queryByText(`Menghapus ${ranks[0].name}...`),
        ).not.toBeInTheDocument(),
      )
    })

    it('should shows success toast when one of ranks is successfully deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteRankAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<RanksTable ranks={ranks} />)

      await deleteRank(user, ranks[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${ranks[0].name}...`),
        ).toBeVisible(),
      )

      act(() => {
        resolve({ data: true })
      })

      const toastEl = screen.getByRole('region', { name: /notifications/i })
      await waitFor(() =>
        expect(
          within(toastEl).getByText(`${ranks[0].name} berhasil dihapus`),
        ).toBeVisible(),
      )
    })

    it('should shows error toast when one of ranks is failed to be deleted', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteRankAction).mockImplementationOnce(
        () => new Promise((r) => (resolve = r)),
      )
      const { user } = render(<RanksTable ranks={ranks} />)

      await deleteRank(user, ranks[0])

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText(`Menghapus ${ranks[0].name}...`),
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
