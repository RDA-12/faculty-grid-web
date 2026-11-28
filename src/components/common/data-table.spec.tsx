import { describe, expect, it } from 'vitest'
import { createColumnHelper } from '@tanstack/react-table'
import { render, screen, within } from '../../../test/rtl-helper'
import { DataTable, type DefaultTableFeatures } from './data-table'

type Item = {
  id: string
  name: string
  tag: string
}

const columnHelper = createColumnHelper<DefaultTableFeatures, Item>()

const columns = columnHelper.columns([
  columnHelper.display({
    id: 'number',
    header: '#',
    cell: ({ row }) => {
      const displayIndex = row.getDisplayIndex()
      return displayIndex === -1 ? '' : displayIndex + 1
    },
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: 'Nama',
  }),
  columnHelper.accessor('tag', {
    id: 'tag',
    header: 'Tag',
    cell: ({ getValue }) => `Tag: ${getValue()}`,
  }),
  columnHelper.display({
    id: 'actions',
    header: 'Aksi',
    cell: ({ row }) => <button type="button">Aksi {row.original.name}</button>,
  }),
])

describe('DataTable', () => {
  const items: Item[] = [
    { id: '1', name: 'Item Satu', tag: 'alpha' },
    { id: '2', name: 'Item Dua', tag: 'beta' },
  ]

  describe('Render', () => {
    it('should render headers and row cells including custom cell renderers', () => {
      render(<DataTable columns={columns} data={items} emptyMessage="Kosong" />)

      expect(screen.getByRole('columnheader', { name: '#' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Nama' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Tag' })).toBeVisible()
      expect(screen.getByRole('columnheader', { name: 'Aksi' })).toBeVisible()

      for (const [index, item] of items.entries()) {
        const row = screen.getByRole('row', {
          name: new RegExp(item.name, 'i'),
        })
        expect(row).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', { name: String(index + 1) }),
        ).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', { name: item.name }),
        ).toBeInTheDocument()
        expect(
          within(row).getByRole('cell', { name: `Tag: ${item.tag}` }),
        ).toBeInTheDocument()
        expect(
          within(row).getByRole('button', { name: `Aksi ${item.name}` }),
        ).toBeVisible()
      }
    })

    it('should render emptyMessage with full colSpan when data is empty', () => {
      render(
        <DataTable columns={columns} data={[]} emptyMessage="Belum ada data" />,
      )

      const emptyCell = screen.getByText('Belum ada data')
      expect(emptyCell).toBeVisible()
      expect(emptyCell).toHaveAttribute('colspan', String(columns.length))
    })

    it('should apply data-testid when testId is provided', () => {
      render(
        <DataTable
          columns={columns}
          data={items}
          emptyMessage="Kosong"
          testId="ItemsTable"
        />,
      )

      expect(screen.getByTestId('ItemsTable')).toBeVisible()
    })

    it('should apply small column classes to default smallColumnIds (number and actions)', () => {
      render(<DataTable columns={columns} data={items} emptyMessage="Kosong" />)

      const numberHeader = screen.getByRole('columnheader', { name: '#' })
      const actionsHeader = screen.getByRole('columnheader', { name: 'Aksi' })
      const nameHeader = screen.getByRole('columnheader', { name: 'Nama' })

      expect(numberHeader).toHaveClass('w-16', 'text-center')
      expect(actionsHeader).toHaveClass('w-16', 'text-center')
      expect(nameHeader).not.toHaveClass('w-16', 'text-center')

      const firstRow = screen.getByRole('row', { name: /Item Satu/i })
      const numberCell = within(firstRow).getByRole('cell', { name: '1' })
      const actionsCell = within(firstRow).getByRole('cell', {
        name: 'Aksi Item Satu',
      })
      const nameCell = within(firstRow).getByRole('cell', {
        name: 'Item Satu',
      })

      expect(numberCell).toHaveClass('text-center')
      expect(actionsCell).toHaveClass('text-center')
      expect(nameCell).not.toHaveClass('text-center')
    })

    it('should respect custom smallColumnIds override', () => {
      render(
        <DataTable
          columns={columns}
          data={items}
          emptyMessage="Kosong"
          smallColumnIds={['tag']}
        />,
      )

      const tagHeader = screen.getByRole('columnheader', { name: 'Tag' })
      const numberHeader = screen.getByRole('columnheader', { name: '#' })
      expect(tagHeader).toHaveClass('w-16', 'text-center')
      expect(numberHeader).not.toHaveClass('w-16', 'text-center')

      const firstRow = screen.getByRole('row', { name: /Item Satu/i })
      const tagCell = within(firstRow).getByRole('cell', { name: 'Tag: alpha' })
      const numberCell = within(firstRow).getByRole('cell', { name: '1' })
      expect(tagCell).toHaveClass('text-center')
      expect(numberCell).not.toHaveClass('text-center')
    })
  })
})
