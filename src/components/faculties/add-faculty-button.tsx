'use client'

import { toast } from 'sonner'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import FacultyForm from './faculty-form'

type AddFacultyButton = {
  label?: string
}

export default function AddFacultyButton({
  label = 'Tambah baru',
}: AddFacultyButton) {
  return (
    <Dialog
      onOpenChange={() => {
        toast.dismiss()
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-min" data-testid="AddFacultyButton">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Fakultas</DialogTitle>
        </DialogHeader>
        <FacultyForm />
      </DialogContent>
    </Dialog>
  )
}
