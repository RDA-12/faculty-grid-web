'use client'

import type { Faculty } from '@/lib/faculties/faculty.types'
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

type UseFacultyDeleteDialogProps = {
  /**
   * Fired when dialog close by delete button
   *
   * NOTE: DO NOT update state within this callback
   */
  onDeleted?: (f: Faculty) => void
}

export function useFacultyDeleteDialog(props?: UseFacultyDeleteDialogProps) {
  const [faculty, setFaculty] = useState<Faculty | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(
    (isDeleted: boolean) => {
      if (isDeleted && props?.onDeleted && faculty) {
        props.onDeleted(faculty)
      }
      setIsOpen(false)
      setFaculty(null)
    },
    [props, faculty],
  )

  const open = useCallback((faculty: Faculty) => {
    setIsOpen(true)
    setFaculty(faculty)
  }, [])

  return { isOpen, open, close, faculty }
}

type FacultyActionDialogProps = {
  controller: FacultyActionDeleteDialogController
}

export type FacultyActionDeleteDialogController = ReturnType<
  typeof useFacultyDeleteDialog
>

/**
 * Creates a AlertDialog which also handle faculty deletion using
 * deleteFacultyAction
 */
export function FacultyActionDeleteDialog({
  controller,
}: FacultyActionDialogProps) {
  const { faculty, isOpen, close } = controller

  if (!faculty) return

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
          <AlertDialogTitle>Hapus fakultas?</AlertDialogTitle>
          <AlertDialogDescription>
            Seluruh data {faculty.name} akun dipindahkan ke sampah, termasuk
            seluruh data yang berhubang dengan fakultas ini, seperti program
            studi, mata kuliah, dan dosen.
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
