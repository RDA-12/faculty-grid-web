import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '../../../test/rtl-helper'
import AddRankButton from './add-rank-button'

vi.mock('@/lib/rank/rank.action', () => ({
  createRankAction: vi.fn(),
}))

describe('AddRankButton', () => {
  const label = 'Tambah baru'

  describe('Render', () => {
    it('should show add button', () => {
      render(<AddRankButton label={label} />)

      expect(screen.getByRole('button', { name: label })).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should show RankForm when pressed', async () => {
      const { user } = render(<AddRankButton />)

      await user.click(screen.getByRole('button', { name: label }))

      expect(screen.getByRole('dialog')).toBeVisible()
      expect(screen.getByText(/tambah pangkat\/golongan/i)).toBeVisible()
      expect(screen.getByTestId('RankForm')).toBeVisible()
    })

    it('allows interaction with RankForm', async () => {
      const { user } = render(<AddRankButton />)

      await user.click(screen.getByRole('button', { name: label }))

      const selectEl = screen.getByRole('combobox')
      await user.click(selectEl)
      await user.click(screen.getByRole('option', { name: 'ASN' }))
      expect(screen.getAllByText('ASN').length).toBeGreaterThan(0)
      expect(screen.getByRole('dialog')).toBeVisible()

      const inputEl = screen.getByLabelText(/nama pangkat\/golongan/i)
      await user.type(inputEl, 'Penata Muda (III/a)')
      expect(inputEl).toHaveValue('Penata Muda (III/a)')
    })
  })
})
