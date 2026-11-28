import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen } from '../../../test/rtl-helper'
import {
  RankActionDeleteDialog,
  useRankDeleteDialog,
  type RankActionDeleteDialogController,
} from './rank-action-dialog'
import { RankType, type Rank } from '@/lib/rank/rank.types'

describe('useRankDeleteDialog', () => {
  const rank: Rank = {
    id: 'id',
    name: 'Penata Muda (III/a)',
    type: RankType.asn,
  }

  it('should set rank and isOpen when open is called', () => {
    const { result } = renderHook(() => useRankDeleteDialog())

    act(() => {
      result.current.open(rank)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.rank).toStrictEqual(rank)
  })

  it('should set rank to null and isOpen to false when close is called', () => {
    const { result } = renderHook(() => useRankDeleteDialog())

    act(() => {
      result.current.open(rank)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.rank).toStrictEqual(rank)

    act(() => {
      result.current.close(false)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.rank).toBeNull()
  })

  it('should calls onDeleted when it close with onDeleted provided', () => {
    let deleted: Rank | undefined
    const { result } = renderHook(() =>
      useRankDeleteDialog({
        onDeleted(r) {
          deleted = r
        },
      }),
    )

    act(() => {
      result.current.open(rank)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.rank).toStrictEqual(rank)

    act(() => {
      result.current.close(true)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.rank).toBeNull()
    expect(deleted).toStrictEqual(rank)
  })
})

describe('RankActionDialog', () => {
  const rank: Rank = {
    id: 'id',
    name: 'Penata Muda (III/a)',
    type: RankType.asn,
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('RankActionDeleteDialog', () => {
    const controller: RankActionDeleteDialogController = {
      isOpen: true,
      open: vi.fn(),
      close: vi.fn(),
      rank: rank,
    }

    describe('Render', () => {
      it('should shows correct title', () => {
        render(<RankActionDeleteDialog controller={controller} />)

        expect(
          screen.getByRole('heading', {
            level: 2,
            name: /hapus pangkat\/golongan/i,
          }),
        ).toBeVisible()
      })

      it('should shows correct description', () => {
        render(<RankActionDeleteDialog controller={controller} />)

        expect(
          screen.getByText(
            `Seluruh data ${rank.name} akan dipindahkan ke sampah, termasuk seluruh data yang berhubungan dengan pangkat/golongan ini.`,
          ),
        ).toBeVisible()
      })

      it('should shows cancel button', () => {
        render(<RankActionDeleteDialog controller={controller} />)

        expect(screen.getByRole('button', { name: /batalkan/i })).toBeVisible()
      })

      it('should shows delete button', () => {
        render(<RankActionDeleteDialog controller={controller} />)

        expect(screen.getByRole('button', { name: /hapus/i })).toBeVisible()
      })

      it('should not render dialog when closed', async () => {
        render(
          <RankActionDeleteDialog
            controller={{ ...controller, isOpen: false }}
          />,
        )

        expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
      })
    })

    describe('Interactions', () => {
      it('should call close on controller when cancel button is pressed', async () => {
        const { user } = render(
          <RankActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /batalkan/i }))
        expect(controller.close).toHaveBeenCalledOnce()
      })

      it('should call close on controller when delete button is pressed', async () => {
        const { user } = render(
          <RankActionDeleteDialog controller={controller} />,
        )

        expect(screen.getByRole('alertdialog')).toBeVisible()
        await user.click(screen.getByRole('button', { name: /hapus/i }))
        expect(controller.close).toHaveBeenCalledOnce()
      })
    })
  })
})
