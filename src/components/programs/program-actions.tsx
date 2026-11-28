'use client'

import { Eye, MoreHorizontal, Pencil, TrashIcon } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'
import type { Program } from '@/lib/programs/program.types'
import { useDeleteProgram } from '@/lib/programs/programs.hook'
import Link from 'next/link'

type ProgramActionsProps = {
  program: Program
  onDeleteClicked?: () => void
}

/**
 * Creates a DropdownMenu with list of program actions
 *
 * Its meant to be used as actions row in ProgramsTable
 */
export default function ProgramActions({
  program,
  onDeleteClicked,
}: ProgramActionsProps) {
  const { pendingDeletion } = useDeleteProgram()
  const isDeleting = pendingDeletion.includes(program)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label={`Aksi ${program.name}`}
            disabled={isDeleting}
          >
            {isDeleting ? (
              'Menghapus...'
            ) : (
              <MoreHorizontal className="h-4 w-4" data-testid="moreIcon" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
            <DropdownMenuItem asChild>
              <Link
                href={`/dashboard/programs/${program.id}`}
                aria-label={`Lihat detail ${program.name}`}
              >
                <Eye />
                <span>Lihat detail</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Pencil />
              Update cepat
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive" onClick={onDeleteClicked}>
              <TrashIcon />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
