import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, renderHook, screen } from '../../../test/rtl-helper'
import {
  DeleteDialog,
  useDeleteDialog,
  type DeleteDialogController,
} from './delete-dialog'

type SampleEntity = {
  id: string
  name: string
}

describe('useDeleteDialog', () => {
  const item: SampleEntity = {
    id: 'id',
    name: 'Fakultas Teknik',
  }

  it('should set data and isOpen when open is called', () => {
    const { result } = renderHook(() => useDeleteDialog<SampleEntity>())

    act(() => {
      result.current.open(item)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.data).toStrictEqual(item)
  })

  it('should set data to null and isOpen to false when close(false) is called', () => {
    const onDeleted = vi.fn()
    const { result } = renderHook(() =>
      useDeleteDialog<SampleEntity>({ onDeleted }),
    )

    act(() => {
      result.current.open(item)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.data).toStrictEqual(item)

    act(() => {
      result.current.close(false)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.data).toBeNull()
    expect(onDeleted).not.toHaveBeenCalled()
  })

  it('should call onDeleted and reset when close(true) is called', () => {
    let deleted: SampleEntity | undefined
    const { result } = renderHook(() =>
      useDeleteDialog<SampleEntity>({
        onDeleted(d) {
          deleted = d
        },
      }),
    )

    act(() => {
      result.current.open(item)
    })

    expect(result.current.isOpen).toBeTruthy()
    expect(result.current.data).toStrictEqual(item)

    act(() => {
      result.current.close(true)
    })

    expect(result.current.isOpen).toBeFalsy()
    expect(result.current.data).toBeNull()
    expect(deleted).toStrictEqual(item)
  })
})

describe('DeleteDialog', () => {
  const item: SampleEntity = {
    id: 'id',
    name: 'Fakultas Teknik',
  }

  const controller: DeleteDialogController<SampleEntity> = {
    isOpen: true,
    open: vi.fn(),
    close: vi.fn(),
    data: item,
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Render', () => {
    it('should show default title from entityName', () => {
      render(
        <DeleteDialog
          controller={controller}
          accessKey="name"
          entityName="fakultas"
        />,
      )

      expect(
        screen.getByRole('heading', { level: 2, name: 'Hapus fakultas?' }),
      ).toBeVisible()
    })

    it('should show default description interpolating data[accessKey] and entityName', () => {
      render(
        <DeleteDialog
          controller={controller}
          accessKey="name"
          entityName="fakultas"
        />,
      )

      expect(
        screen.getByText(
          `Seluruh data ${item.name} akan dipindahkan ke sampah, termasuk seluruh data yang berhubungan dengan fakultas ini.`,
        ),
      ).toBeVisible()
    })

    it('should allow custom title and string description overrides', () => {
      render(
        <DeleteDialog
          controller={controller}
          accessKey="name"
          entityName="fakultas"
          title="Konfirmasi hapus"
          description="Deskripsi khusus"
        />,
      )

      expect(
        screen.getByRole('heading', { level: 2, name: 'Konfirmasi hapus' }),
      ).toBeVisible()
      expect(screen.getByText('Deskripsi khusus')).toBeVisible()
    })

    it('should allow custom description callback override', () => {
      render(
        <DeleteDialog
          controller={controller}
          accessKey="name"
          entityName="fakultas"
          description={(d) => `Hapus item ${d.id}: ${d.name}`}
        />,
      )

      expect(
        screen.getByText(`Hapus item ${item.id}: ${item.name}`),
      ).toBeVisible()
    })

    it('should show cancel and delete buttons', () => {
      render(
        <DeleteDialog
          controller={controller}
          accessKey="name"
          entityName="fakultas"
        />,
      )

      expect(screen.getByRole('button', { name: /batalkan/i })).toBeVisible()
      expect(screen.getByRole('button', { name: /hapus/i })).toBeVisible()
    })

    it('should not render dialog when closed', () => {
      render(
        <DeleteDialog
          controller={{ ...controller, isOpen: false }}
          accessKey="name"
          entityName="fakultas"
        />,
      )

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })

    it('should not render dialog when data is null', () => {
      render(
        <DeleteDialog
          controller={{ ...controller, data: null }}
          accessKey="name"
          entityName="fakultas"
        />,
      )

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    })
  })

  describe('Interactions', () => {
    it('should call close(false) on controller when cancel button is pressed', async () => {
      const { user } = render(
        <DeleteDialog
          controller={controller}
          accessKey="name"
          entityName="fakultas"
        />,
      )

      expect(screen.getByRole('alertdialog')).toBeVisible()
      await user.click(screen.getByRole('button', { name: /batalkan/i }))
      expect(controller.close).toHaveBeenCalledExactlyOnceWith(false)
    })

    it('should call close(true) on controller when delete button is pressed', async () => {
      const { user } = render(
        <DeleteDialog
          controller={controller}
          accessKey="name"
          entityName="fakultas"
        />,
      )

      expect(screen.getByRole('alertdialog')).toBeVisible()
      await user.click(screen.getByRole('button', { name: /hapus/i }))
      expect(controller.close).toHaveBeenCalledExactlyOnceWith(true)
    })
  })
})
