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
import RankForm from './rank-form'

type AddRankButtonProps = {
  label?: string
}

export default function AddRankButton({
  label = 'Tambah baru',
}: AddRankButtonProps) {
  return (
    <Dialog
      onOpenChange={() => {
        toast.dismiss()
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-min" data-testid="AddRankButton">
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Pangkat/Golongan</DialogTitle>
        </DialogHeader>
        <RankForm />
      </DialogContent>
    </Dialog>
  )
}
