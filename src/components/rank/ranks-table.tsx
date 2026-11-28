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
import RankActions from './rank-actions'
import { useDeleteRank } from '@/lib/rank/rank.hook'
import { toast } from 'sonner'
import { useRef } from 'react'
import { DeleteDialog, useDeleteDialog } from '../common/delete-dialog'

const RANK_TYPE_LABELS: Record<RankType, string> = {
  [RankType.asn]: 'ASN',
  [RankType.military]: 'Militer',
}

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, Rank>()

const createColumns = (onDeleteClicked?: (rank: Rank) => void) =>
  columnHelper.columns([
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
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <RankActions
          rank={row.original}
          onDeleteClicked={() => {
            if (onDeleteClicked) {
              onDeleteClicked(row.original)
            }
          }}
        />
      ),
    }),
  ])

type RanksTableProps = {
  ranks: Rank[]
}

export default function RanksTable({ ranks }: RanksTableProps) {
  // Track rank id to its loading toast id
  const pendingDeletionRecord = useRef<Record<string, string | number>>({})
  const { deleteRank } = useDeleteRank((rank, data) => {
    const loadingToastId = pendingDeletionRecord.current[rank.id]
    toast.dismiss(loadingToastId)
    if (data.data) {
      toast.success(`${rank.name} berhasil dihapus`)
    }
    if (data.error) {
      toast.error(data.error.title, { description: data.error.detail })
    }
  })

  const rankDeleteDialogController = useDeleteDialog<Rank>({
    onDeleted(r) {
      const toastId = toast.loading(`Menghapus ${r.name}...`)
      pendingDeletionRecord.current[r.id] = toastId
      deleteRank(r)
    },
  })

  const columns = createColumns((r) => {
    rankDeleteDialogController.open(r)
  })
  const table = useTable({ features, columns, data: ranks })

  return (
    <>
      <div
        className="w-full flex-1 min-h-0 overflow-auto rounded-md border"
        data-testid="RanksTable"
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
                      cell.column.id === 'number' ||
                      cell.column.id === 'actions'
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

      <DeleteDialog
        controller={rankDeleteDialogController}
        accessKey="name"
        entityName="pangkat/golongan"
      />
    </>
  )
}
