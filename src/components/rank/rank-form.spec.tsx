import { describe, expect, it, vi } from 'vitest'
import {
  act,
  render,
  screen,
  waitFor,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import { createRankAction } from '@/lib/rank/rank.action'
import type { ActionState } from '@/lib/common/types'
import { Rank, RankType } from '@/lib/rank/rank.types'
import RankForm from './rank-form'
import type { CreateRankRequest } from '@/lib/rank/rank.schema'

vi.mock('@/lib/rank/rank.action', () => ({
  createRankAction: vi.fn(),
}))

describe('RankForm', () => {
  async function clickSubmit(user: UserEvent) {
    await user.click(
      screen.getByRole('button', { name: /buat pangkat\/golongan/i }),
    )
  }

  async function inputName(user: UserEvent, name: string) {
    const inputEl = screen.getByLabelText(/nama pangkat\/golongan/i)
    await user.type(inputEl, name)
    return inputEl
  }

  async function selectType(user: UserEvent, typeName: string) {
    const triggerEl = screen.getByRole('combobox')
    await user.click(triggerEl)
    await user.click(screen.getByRole('option', { name: typeName }))
  }

  describe('Render', () => {
    it('should show type selector', () => {
      render(<RankForm />)

      expect(screen.getByText('Pilih jenis pangkat/golongan')).toBeVisible()
    })

    it('should show name field', () => {
      render(<RankForm />)

      expect(screen.getByLabelText(/nama pangkat\/golongan/i)).toBeVisible()
      expect(
        screen.getByPlaceholderText(/penata muda \(iii\/a\)/i),
      ).toBeVisible()
    })

    it('should show save button', () => {
      render(<RankForm />)

      expect(
        screen.getByRole('button', { name: /buat pangkat\/golongan/i }),
      ).toBeVisible()
    })

    it('should disable save button and show spinner when pending', async () => {
      let resolveAction!: (v: ActionState<unknown, Rank>) => void
      vi.mocked(createRankAction).mockImplementation(
        () =>
          new Promise((r) => {
            resolveAction = r
          }),
      )

      const { user } = render(<RankForm />)

      await selectType(user, 'ASN')
      await inputName(user, 'Penata Muda (III/a)')
      await clickSubmit(user)

      expect(
        screen.getByRole('button', { name: /buat pangkat\/golongan/i }),
      ).toBeDisabled()
      expect(screen.getByRole('status')).toBeVisible()

      await act(async () => {
        resolveAction({
          data: {
            id: 'id',
            name: 'Penata Muda (III/a)',
            type: RankType.asn,
          },
        })
      })

      await waitFor(() =>
        expect(
          screen.getByRole('button', { name: /buat pangkat\/golongan/i }),
        ).not.toBeDisabled(),
      )
      expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it('should show error when submit with invalid form', async () => {
      vi.mocked(createRankAction).mockResolvedValue({
        errors: {
          name: 'Wajib diisi',
          type: 'Wajib diisi',
        },
      })

      const { user } = render(<RankForm />)

      await clickSubmit(user)

      const errorMessages = screen.getAllByText('Wajib diisi')
      expect(errorMessages.length).toBeGreaterThan(0)
    })

    it('should show error toast when createRankAction is failed', async () => {
      vi.mocked(createRankAction).mockResolvedValue({
        error: {
          status: 401,
          title: 'Error title',
          detail: 'Error detail',
        },
      })

      const { user } = render(<RankForm />)

      await selectType(user, 'ASN')
      await inputName(user, 'Penata Muda (III/a)')
      await clickSubmit(user)

      const regionEl = screen.getByRole('region', { name: /notifications/i })
      await waitFor(() =>
        expect(within(regionEl).getByText('Error title')).toBeVisible(),
      )
      await waitFor(() =>
        expect(within(regionEl).getByText('Error detail')).toBeVisible(),
      )
    })

    it('should show success toast when createRankAction is success', async () => {
      vi.mocked(createRankAction).mockResolvedValue({
        data: {
          id: 'id',
          name: 'Penata Muda (III/a)',
          type: RankType.asn,
        },
      })

      const { user } = render(<RankForm />)

      await selectType(user, 'ASN')
      await inputName(user, 'Penata Muda (III/a)')
      await clickSubmit(user)

      await waitFor(() =>
        expect(
          within(
            screen.getByRole('region', { name: /notifications/i }),
          ).getByText('Penata Muda (III/a) berhasil dibuat'),
        ).toBeVisible(),
      )
    })
  })

  describe('Interactions', () => {
    it('allows inputting name', async () => {
      const { user } = render(<RankForm />)

      const nameInputEl = await inputName(user, 'Pembina (IV/a)')

      expect(nameInputEl).toHaveValue('Pembina (IV/a)')
    })

    it('allows selecting rank type', async () => {
      const { user } = render(<RankForm />)

      await selectType(user, 'Militer')

      const values = screen.getAllByText('Militer')
      expect(values.length).toBeGreaterThan(0)
    })

    it('should call createRankAction with correct data', async () => {
      const { user } = render(<RankForm />)

      await selectType(user, 'ASN')
      await inputName(user, 'Penata Muda (III/a)')
      await clickSubmit(user)

      const expectedArgs: CreateRankRequest = {
        name: 'Penata Muda (III/a)',
        type: RankType.asn,
      }
      expect(createRankAction).toHaveBeenCalledExactlyOnceWith(expectedArgs)
    })
  })
})
