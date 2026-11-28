'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { RankType, type Rank } from '@/lib/rank/rank.types'
import RankActions from './rank-actions'
import { useDeleteRank } from '@/lib/rank/rank.hook'
import { toast } from 'sonner'
import { useRef } from 'react'
import { DeleteDialog, useDeleteDialog } from '../common/delete-dialog'
import { DataTable, type DefaultTableFeatures } from '../common/data-table'

const RANK_TYPE_LABELS: Record<RankType, string> = {
  [RankType.asn]: 'ASN',
  [RankType.military]: 'Militer',
}

const columnHelper = createColumnHelper<DefaultTableFeatures, Rank>()

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

  return (
    <>
      <DataTable
        columns={columns}
        data={ranks}
        emptyMessage="Belum ada pangkat/golongan yang ditambahkan"
        testId="RanksTable"
      />

      <DeleteDialog
        controller={rankDeleteDialogController}
        accessKey="name"
        entityName="pangkat/golongan"
      />
    </>
  )
}
