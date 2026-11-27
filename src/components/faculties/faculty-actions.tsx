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
import type { Faculty } from '@/lib/faculties/faculty.types'
import { useDeleteFaculty } from '@/lib/faculties/faculties.hook'
import Link from 'next/link'

type FacultyActionsProps = {
  faculty: Faculty
  onDeleteClicked?: () => void
}

/**
 * Creates a DropdownMenu with list of faculty actions
 *
 * Its meant to be used as actions row in FacultiesTable
 */
export default function FacultyActions({
  faculty,
  onDeleteClicked,
}: FacultyActionsProps) {
  const { pendingDeletion } = useDeleteFaculty()
  const isDeleting = pendingDeletion.includes(faculty)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label={`Aksi ${faculty.name}`}
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
                href={`/dashboard/faculties/${faculty.id}`}
                aria-label={`Lihat detail ${faculty.name}`}
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
