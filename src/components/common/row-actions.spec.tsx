import { describe, expect, it } from 'vitest'
import {
  render,
  screen,
  within,
  type UserEvent,
} from '../../../test/rtl-helper'
import RowActions from './row-actions'

describe('RowActions', () => {
  const label = 'Fakultas Teknik'
  const detailHref = '/dashboard/faculties/string'

  async function openDropdown(user: UserEvent) {
    await user.click(
      screen.getByRole('button', {
        name: `Aksi ${label}`,
      }),
    )
  }

  describe('Render', () => {
    it('should show correct trigger', () => {
      render(<RowActions label={label} detailHref={detailHref} />)

      expect(
        screen.getByRole('button', {
          name: `Aksi ${label}`,
        }),
      ).toBeVisible()
      expect(screen.getByTestId('moreIcon')).toBeVisible()
    })

    it('should show see detail item when opened', async () => {
      const { user } = render(
        <RowActions label={label} detailHref={detailHref} />,
      )

      await openDropdown(user)

      const detailItem = screen.getByRole('menuitem', {
        name: `Lihat detail ${label}`,
      })
      expect(detailItem).toBeVisible()
      expect(detailItem).toHaveAttribute('href', detailHref)
    })

    it('should show update item when opened', async () => {
      const { user } = render(
        <RowActions label={label} detailHref={detailHref} />,
      )

      await openDropdown(user)

      expect(
        screen.getByRole('menuitem', { name: /update cepat/i }),
      ).toBeVisible()
    })

    it('should show delete item when opened', async () => {
      const { user } = render(
        <RowActions label={label} detailHref={detailHref} />,
      )

      await openDropdown(user)

      expect(screen.getByRole('menuitem', { name: /hapus/i })).toBeVisible()
    })

    it('should disable trigger and show placeholder when isDeleting is true', () => {
      render(
        <RowActions label={label} detailHref={detailHref} isDeleting={true} />,
      )

      const triggerEl = screen.getByRole('button', {
        name: `Aksi ${label}`,
      })
      expect(triggerEl).toBeDisabled()
      expect(within(triggerEl).getByText(/menghapus/i)).toBeVisible()
    })
  })

  describe('Interactions', () => {
    it('should call onDeleteClicked when delete item is pressed', async () => {
      let pressed = false
      const { user } = render(
        <RowActions
          label={label}
          detailHref={detailHref}
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
