'use client'

import { createColumnHelper } from '@tanstack/react-table'
import type { Faculty } from '@/lib/faculties/faculty.types'
import FacultiesAction from './faculty-actions'
import { useDeleteFaculty } from '@/lib/faculties/faculties.hook'
import { toast } from 'sonner'
import { useRef } from 'react'
import { DeleteDialog, useDeleteDialog } from '../common/delete-dialog'
import { DataTable, type DefaultTableFeatures } from '../common/data-table'

const columnHelper = createColumnHelper<DefaultTableFeatures, Faculty>()

const createColumns = (onDeleteClicked?: (faculty: Faculty) => void) =>
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
      header: 'Nama Fakultas',
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <FacultiesAction
          faculty={row.original}
          onDeleteClicked={() => {
            if (onDeleteClicked) {
              onDeleteClicked(row.original)
            }
          }}
        />
      ),
    }),
  ])

type FacultiesTableProps = {
  faculties: Faculty[]
}

export default function FacultiesTable({ faculties }: FacultiesTableProps) {
  // Track faculty id to its loading toast id
  const pendingDeletionRecord = useRef<Record<string, string | number>>({})
  const { deleteFaculty } = useDeleteFaculty((faculty, data) => {
    const loadingToastId = pendingDeletionRecord.current[faculty.id]
    toast.dismiss(loadingToastId)
    if (data.data) {
      toast.success(`${faculty.name} berhasil dihapus`)
    }
    if (data.error) {
      toast.error(data.error.title, { description: data.error.detail })
    }
  })

  const facultyDeleteDialogController = useDeleteDialog<Faculty>({
    onDeleted(f) {
      const toastId = toast.loading(`Menghapus ${f.name}...`)
      pendingDeletionRecord.current[f.id] = toastId
      deleteFaculty(f)
    },
  })

  const columns = createColumns((f) => {
    facultyDeleteDialogController.open(f)
  })

  return (
    <>
      <DataTable
        columns={columns}
        data={faculties}
        emptyMessage="Belum ada fakultas yang ditambahkan"
        testId="FacultiesTable"
      />

      <DeleteDialog
        controller={facultyDeleteDialogController}
        accessKey="name"
        entityName="fakultas"
      />
    </>
  )
}
