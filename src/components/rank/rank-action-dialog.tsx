'use client'

import type { Rank } from '@/lib/rank/rank.types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '../ui/alert-dialog'
import { Trash2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'

type UseRankDeleteDialogProps = {
  /**
   * Fired when dialog close by delete button
   *
   * NOTE: DO NOT update state within this callback
   */
  onDeleted?: (r: Rank) => void
}

export function useRankDeleteDialog(props?: UseRankDeleteDialogProps) {
  const [rank, setRank] = useState<Rank | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(
    (isDeleted: boolean) => {
      if (isDeleted && props?.onDeleted && rank) {
        props.onDeleted(rank)
      }
      setIsOpen(false)
      setRank(null)
    },
    [props, rank],
  )

  const open = useCallback((rank: Rank) => {
    setIsOpen(true)
    setRank(rank)
  }, [])

  return { isOpen, open, close, rank }
}

type RankActionDialogProps = {
  controller: RankActionDeleteDialogController
}

export type RankActionDeleteDialogController = ReturnType<
  typeof useRankDeleteDialog
>

/**
 * Creates an AlertDialog which also handles rank deletion using
 * deleteRankAction
 */
export function RankActionDeleteDialog({ controller }: RankActionDialogProps) {
  const { rank, isOpen, close } = controller

  if (!rank) return

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) return
        close(false)
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>Hapus pangkat/golongan?</AlertDialogTitle>
          <AlertDialogDescription>
            Seluruh data {rank.name} akan dipindahkan ke sampah, termasuk
            seluruh data yang berhubungan dengan pangkat/golongan ini.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant={'ghost'}>Batalkan</AlertDialogCancel>
          <AlertDialogAction
            variant={'destructive'}
            onClick={(e) => {
              e.preventDefault()
              close(true)
            }}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
