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
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useState,
} from 'react'
import { deleteFacultyAction } from '@/lib/faculties/faculties.action'
import { toast } from 'sonner'
import { useFaculties } from '@/lib/faculties/faculties.hook'

type FacultyActionDialogProps = {
  controller: FacultyActionDeleteDialogController
}

export type FacultyActionDeleteDialogController = ReturnType<
  typeof useFacultyDeleteDialog
>

export function useFacultyDeleteDialog(
  faculty: Faculty,
  args?: { initialOpen?: boolean },
) {
  const [isOpen, setIsOpen] = useState(args?.initialOpen ?? false)

  const close = useCallback(() => {
    setIsOpen(false)
  }, [])

  const open = useCallback(() => {
    setIsOpen(true)
  }, [])

  return { isOpen, open, close, faculty }
}

/**
 * Creates a AlertDialog which also handle faculty deletion using
 * deleteFacultyAction
 */
export function FacultyActionDeleteDialog({
  controller,
}: FacultyActionDialogProps) {
  const [state, action, isPending] = useActionState(deleteFacultyAction, {})
  const { faculty, isOpen, open, close } = controller
  const { getFaculties } = useFaculties()

  useEffect(() => {
    if (!isPending) return
    toast.loading(`Menghapus ${faculty.name}...`)
  }, [isPending, faculty.name])
  useEffect(() => {
    toast.dismiss()
    if (state.error) {
      toast.error(state.error.title, { description: state.error.detail })
    }
    if (state.data) {
      toast.success(`${faculty.name} berhasil dihapus`)
      void getFaculties(true)
    }
  }, [state, faculty.name, getFaculties])

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          open()
        } else {
          close()
        }
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
            onClick={() => {
              startTransition(() => {
                action(faculty.id)
              })
            }}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
