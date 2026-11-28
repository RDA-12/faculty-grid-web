'use client'

import { createColumnHelper } from '@tanstack/react-table'
import { ProgramDegreeLevel, type Program } from '@/lib/programs/program.types'
import ProgramActions from './program-actions'
import { useDeleteProgram } from '@/lib/programs/programs.hook'
import { toast } from 'sonner'
import { useRef } from 'react'
import { DeleteDialog, useDeleteDialog } from '../common/delete-dialog'
import { DataTable, type DefaultTableFeatures } from '../common/data-table'

const DEGREE_LEVEL_LABELS: Record<ProgramDegreeLevel, string> = {
  [ProgramDegreeLevel.bachelor]: 'S1 - Sarjana',
  [ProgramDegreeLevel.master]: 'S2 - Magister',
  [ProgramDegreeLevel.doctorate]: 'S3 - Doktor',
}

const columnHelper = createColumnHelper<DefaultTableFeatures, Program>()

const createColumns = (onDeleteClicked?: (program: Program) => void) =>
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
      header: 'Nama Program Studi',
    }),
    columnHelper.accessor('degreeLevel', {
      id: 'degreeLevel',
      header: 'Tingkat Pendidikan',
      cell: ({ getValue }) => DEGREE_LEVEL_LABELS[getValue()],
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => (
        <ProgramActions
          program={row.original}
          onDeleteClicked={() => {
            if (onDeleteClicked) {
              onDeleteClicked(row.original)
            }
          }}
        />
      ),
    }),
  ])

type ProgramsTableProps = {
  programs: Program[]
}

export default function ProgramsTable({ programs }: ProgramsTableProps) {
  // Track program id to its loading toast id
  const pendingDeletionRecord = useRef<Record<string, string | number>>({})
  const { deleteProgram } = useDeleteProgram((program, data) => {
    const loadingToastId = pendingDeletionRecord.current[program.id]
    toast.dismiss(loadingToastId)
    if (data.data) {
      toast.success(`${program.name} berhasil dihapus`)
    }
    if (data.error) {
      toast.error(data.error.title, { description: data.error.detail })
    }
  })

  const programDeleteDialogController = useDeleteDialog<Program>({
    onDeleted(p) {
      const toastId = toast.loading(`Menghapus ${p.name}...`)
      pendingDeletionRecord.current[p.id] = toastId
      deleteProgram(p)
    },
  })

  const columns = createColumns((p) => {
    programDeleteDialogController.open(p)
  })

  return (
    <>
      <DataTable
        columns={columns}
        data={programs}
        emptyMessage="Belum ada program studi yang ditambahkan"
        testId="ProgramsTable"
      />

      <DeleteDialog
        controller={programDeleteDialogController}
        accessKey="name"
        entityName="program studi"
      />
    </>
  )
}
