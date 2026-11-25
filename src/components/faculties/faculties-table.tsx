'use client'

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import type { Faculty } from '@/lib/faculties/faculty.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import FacultiesAction from './faculty-actions'

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, Faculty>()

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
    header: 'Nama Fakultas',
  }),
  columnHelper.display({
    id: 'actions',
    cell: ({ row }) => <FacultiesAction faculty={row.original} />,
  }),
])

type FacultiesTableProps = {
  faculties: Faculty[]
}

export default function FacultiesTable({ faculties }: FacultiesTableProps) {
  const table = useTable({ features, columns, data: faculties })

  return (
    <div
      className="w-full overflow-hidden rounded-md border"
      data-testid="FacultiesTable"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const smallHeader =
                  header.id === 'number' || header.id === 'actions'

                return (
                  <TableHead
                    key={header.id}
                    className={smallHeader ? 'w-16 text-center' : undefined}
                  >
                    {header.isPlaceholder ? null : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().map((cell) => {
                  const smallHeader =
                    cell.column.id === 'number' || cell.column.id === 'actions'
                  return (
                    <TableCell
                      key={cell.id}
                      className={smallHeader ? 'text-center' : undefined}
                    >
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  )
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="min-h-24 h-full text-center"
              >
                Belum ada fakultas yang ditambahkan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
