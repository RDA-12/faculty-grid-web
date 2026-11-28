'use client'

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { RankType, type Rank } from '@/lib/rank/rank.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'

const RANK_TYPE_LABELS: Record<RankType, string> = {
  [RankType.asn]: 'ASN',
  [RankType.military]: 'Militer',
}

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, Rank>()

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
    header: 'Nama Pangkat/Golongan',
  }),
  columnHelper.accessor('type', {
    id: 'type',
    header: 'Jenis Pangkat/Golongan',
    cell: ({ getValue }) => RANK_TYPE_LABELS[getValue()],
  }),
])

type RanksTableProps = {
  ranks: Rank[]
}

export default function RanksTable({ ranks }: RanksTableProps) {
  const table = useTable({ features, columns, data: ranks })

  return (
    <div
      className="w-full flex-1 min-h-0 overflow-auto rounded-md border"
      data-testid="RanksTable"
    >
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const smallHeader = header.id === 'number'

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
                  const smallHeader = cell.column.id === 'number'
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
                colSpan={columns.length}
                className="min-h-24 h-full text-center"
              >
                Belum ada pangkat/golongan yang ditambahkan
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
