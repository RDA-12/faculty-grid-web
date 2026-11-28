'use client'

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

type UseDeleteDialogProps<T> = {
  /**
   * Fired when dialog close by delete button
   *
   * NOTE: DO NOT update state within this callback
   */
  onDeleted?: (data: T) => void
}

export function useDeleteDialog<T>(props?: UseDeleteDialogProps<T>) {
  const [data, setData] = useState<T | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(
    (isDeleted: boolean) => {
      if (isDeleted && props?.onDeleted && data) {
        props.onDeleted(data)
      }
      setIsOpen(false)
      setData(null)
    },
    [props, data],
  )

  const open = useCallback((item: T) => {
    setIsOpen(true)
    setData(item)
  }, [])

  return { isOpen, open, close, data }
}

export type DeleteDialogController<T> = ReturnType<typeof useDeleteDialog<T>>

type DeleteDialogProps<T> = {
  controller: DeleteDialogController<T>
  accessKey: keyof T
  entityName: string
  title?: string
  description?: string | ((data: T) => string)
}

/**
 * Generic AlertDialog for confirming entity deletion
 */
export function DeleteDialog<T>({
  controller,
  accessKey,
  entityName,
  title,
  description,
}: DeleteDialogProps<T>) {
  const { data, isOpen, close } = controller

  if (!data) return

  const itemLabel = String(data[accessKey])
  const resolvedTitle = title ?? `Hapus ${entityName}?`
  const resolvedDescription =
    typeof description === 'function'
      ? description(data)
      : (description ??
        `Seluruh data ${itemLabel} akan dipindahkan ke sampah, termasuk seluruh data yang berhubungan dengan ${entityName} ini.`)

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (open) return
        close(false)
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>{resolvedTitle}</AlertDialogTitle>
          <AlertDialogDescription>{resolvedDescription}</AlertDialogDescription>
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
