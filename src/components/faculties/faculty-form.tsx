'use client'

import { createFacultyAction } from '@/lib/faculties/faculties.action'
import { useActionState, useEffect } from 'react'
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
import { toast } from 'sonner'

/**
 * Creates Fieldset consists of Fields to create new faculty
 */
export default function FacultyForm() {
  const [state, action, isPending] = useActionState(createFacultyAction, {})

  useEffect(() => {
    toast.dismiss()
    if (state.error) {
      toast.error(state.error.title, {
        description: state.error.detail,
        duration: Infinity,
        position: 'top-center',
      })
    }
    if (state.data) {
      toast.success(`${state.data.name} berhasil dibuat`, {
        duration: Infinity,
        position: 'top-center',
      })
    }
  }, [state.error, state.data])

  return (
    <FieldSet data-testid="FacultyForm">
      <form action={action}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Nama Fakultas</FieldLabel>
            <Input
              id="name"
              name="name"
              aria-invalid={!!state.errors?.name}
              placeholder="Fakultas Teknik"
            />
            {state.errors?.name && <FieldError>{state.errors.name}</FieldError>}
          </Field>
          <Field>
            <Button type="submit" disabled={isPending} icon-data="inline-left">
              {isPending && <Spinner />}
              Buat fakultas
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}
