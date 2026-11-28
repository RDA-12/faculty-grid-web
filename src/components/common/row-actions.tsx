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
import Link from 'next/link'
import type { Route } from 'next'

type RowActionsProps<T extends string> = {
  label: string
  detailHref: Route<T>
  isDeleting?: boolean
  onDeleteClicked?: () => void
}

/**
 * Generic DropdownMenu for entity table row actions
 */
export default function RowActions<T extends string>({
  label,
  detailHref,
  isDeleting = false,
  onDeleteClicked,
}: RowActionsProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0"
          aria-label={`Aksi ${label}`}
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
            <Link href={detailHref} aria-label={`Lihat detail ${label}`}>
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
  )
}
