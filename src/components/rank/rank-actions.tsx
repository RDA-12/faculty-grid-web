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
import type { Rank } from '@/lib/rank/rank.types'
import { useDeleteRank } from '@/lib/rank/rank.hook'
import Link from 'next/link'

type RankActionsProps = {
  rank: Rank
  onDeleteClicked?: () => void
}

/**
 * Creates a DropdownMenu with list of rank actions
 *
 * Its meant to be used as actions row in RanksTable
 */
export default function RankActions({
  rank,
  onDeleteClicked,
}: RankActionsProps) {
  const { pendingDeletion } = useDeleteRank()
  const isDeleting = pendingDeletion.includes(rank)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-8 w-8 p-0"
            aria-label={`Aksi ${rank.name}`}
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
                href={`/dashboard/ranks/${rank.id}`}
                aria-label={`Lihat detail ${rank.name}`}
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
