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
    meta: {
      align: 'center',
    },
  }),
  columnHelper.accessor('name', {
    id: 'name',
    header: 'Nama Fakultas',
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
                const isNumber = header.id === 'number'

                return (
                  <TableHead
                    key={header.id}
                    className={isNumber ? 'w-12 text-center' : undefined}
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
                  const isNumber = cell.column.id === 'number'
                  return (
                    <TableCell
                      key={cell.id}
                      className={isNumber ? 'text-center' : undefined}
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
                colSpan={columns.length}
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
