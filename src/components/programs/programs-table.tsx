'use client'

import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { ProgramDegreeLevel, type Program } from '@/lib/programs/program.types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table'
import ProgramActions from './program-actions'
import { useDeleteProgram } from '@/lib/programs/programs.hook'
import { toast } from 'sonner'
import { useRef } from 'react'
import { DeleteDialog, useDeleteDialog } from '../common/delete-dialog'

const DEGREE_LEVEL_LABELS: Record<ProgramDegreeLevel, string> = {
  [ProgramDegreeLevel.bachelor]: 'S1 - Sarjana',
  [ProgramDegreeLevel.master]: 'S2 - Magister',
  [ProgramDegreeLevel.doctorate]: 'S3 - Doktor',
}

const features = tableFeatures({})

const columnHelper = createColumnHelper<typeof features, Program>()

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
  const table = useTable({ features, columns, data: programs })

  return (
    <>
      <div
        className="w-full flex-1 min-h-0 overflow-auto rounded-md border"
        data-testid="ProgramsTable"
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
                  Belum ada program studi yang ditambahkan
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteDialog
        controller={programDeleteDialogController}
        accessKey="name"
        entityName="program studi"
      />
    </>
  )
}
