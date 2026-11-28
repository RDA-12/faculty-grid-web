'use client'

import type { Program } from '@/lib/programs/program.types'
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

type UseProgramDeleteDialogProps = {
  /**
   * Fired when dialog close by delete button
   *
   * NOTE: DO NOT update state within this callback
   */
  onDeleted?: (p: Program) => void
}

export function useProgramDeleteDialog(props?: UseProgramDeleteDialogProps) {
  const [program, setProgram] = useState<Program | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(
    (isDeleted: boolean) => {
      if (isDeleted && props?.onDeleted && program) {
        props.onDeleted(program)
      }
      setIsOpen(false)
      setProgram(null)
    },
    [props, program],
  )

  const open = useCallback((program: Program) => {
    setIsOpen(true)
    setProgram(program)
  }, [])

  return { isOpen, open, close, program }
}

type ProgramActionDialogProps = {
  controller: ProgramActionDeleteDialogController
}

export type ProgramActionDeleteDialogController = ReturnType<
  typeof useProgramDeleteDialog
>

/**
 * Creates a AlertDialog which also handle program deletion using
 * deleteProgramAction
 */
export function ProgramActionDeleteDialog({
  controller,
}: ProgramActionDialogProps) {
  const { program, isOpen, close } = controller

  if (!program) return

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
          <AlertDialogTitle>Hapus program studi?</AlertDialogTitle>
          <AlertDialogDescription>
            Seluruh data {program.name} akan dipindahkan ke sampah, termasuk
            seluruh data yang berhubungan dengan program studi ini.
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
