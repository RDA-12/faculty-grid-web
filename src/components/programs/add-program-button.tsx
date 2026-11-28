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
import ProgramForm from './program-form'

type AddProgramButtonProps = {
  label?: string
}

export default function AddProgramButton({
  label = 'Tambah baru',
}: AddProgramButtonProps) {
  return (
    <Dialog
      onOpenChange={() => {
        toast.dismiss()
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-min" data-testid="AddProgramButton">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Program Studi</DialogTitle>
        </DialogHeader>
        <ProgramForm />
      </DialogContent>
    </Dialog>
  )
}
