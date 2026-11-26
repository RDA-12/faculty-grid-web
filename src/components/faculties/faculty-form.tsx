'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '../ui/field'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Spinner } from '../ui/spinner'
import { useCreateFaculty } from '@/lib/faculties/faculties.hook'
import { CreateFacultySchema } from '@/lib/faculties/faculties.schema'
import { toast } from 'sonner'

/**
 * Creates Fieldset consists of Fields to create new faculty
 */
export default function FacultyForm() {
  const { createFaculty, pendingCreation } = useCreateFaculty((_args, data) => {
    if (data.error) {
      toast.error(data.error.title, {
        description: data.error.detail,
        duration: Infinity,
        position: 'top-center',
      })
    }
    if (data.data) {
      toast.success(`${data.data.name} berhasil dibuat`, {
        duration: Infinity,
        position: 'top-center',
      })
    }
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreateFacultySchema),
  })

  return (
    <FieldSet data-testid="FacultyForm">
      <form onSubmit={handleSubmit(createFaculty)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Nama Fakultas</FieldLabel>
            <Input
              id="name"
              aria-invalid={!!errors?.name}
              placeholder="Fakultas Teknik"
              {...register('name')}
            />
            {errors?.name && <FieldError>{errors.name?.message}</FieldError>}
          </Field>
          <Field>
            <Button
              type="submit"
              disabled={pendingCreation.length > 0}
              icon-data="inline-left"
            >
              {pendingCreation.length > 0 && <Spinner />}
              Buat fakultas
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}
