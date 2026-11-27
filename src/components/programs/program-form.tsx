'use client'

import { useForm, Controller } from 'react-hook-form'
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
import { useCreateProgram } from '@/lib/programs/programs.hook'
import {
  CreateProgramSchema,
  type CreateProgramRequest,
} from '@/lib/programs/programs.schema'
import { toast } from 'sonner'
import FacultiesCombobox from '../faculties/faculties-combobox'
import ProgramDegreeSelector from './program-degree-selector'

/**
 * Creates Fieldset consists of Fields to create new program
 */
export default function ProgramForm() {
  const { createProgram, pendingCreation } = useCreateProgram((_args, data) => {
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
    control,
    formState: { errors },
  } = useForm<CreateProgramRequest>({
    resolver: zodResolver(CreateProgramSchema),
    defaultValues: {
      name: '',
      facultyId: '',
      degreeLevel: undefined,
    },
  })

  return (
    <FieldSet data-testid="ProgramForm">
      <form onSubmit={handleSubmit(createProgram)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="Pilih fakultas">Fakultas</FieldLabel>
            <Controller
              name="facultyId"
              control={control}
              render={({ field }) => (
                <FacultiesCombobox
                  onValueChange={(faculty) => {
                    field.onChange(faculty?.id ?? '')
                  }}
                />
              )}
            />
            {errors?.facultyId && (
              <FieldError>{errors.facultyId?.message}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="degreeLevel">Tingkat Pendidikan</FieldLabel>
            <Controller
              name="degreeLevel"
              control={control}
              render={({ field }) => (
                <ProgramDegreeSelector
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                />
              )}
            />
            {errors?.degreeLevel && (
              <FieldError>{errors.degreeLevel?.message}</FieldError>
            )}
          </Field>
          <Field>
            <FieldLabel htmlFor="name">Nama Program Studi</FieldLabel>
            <Input
              id="name"
              aria-invalid={!!errors?.name}
              placeholder="Sistem Informasi"
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
              Buat program
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}
