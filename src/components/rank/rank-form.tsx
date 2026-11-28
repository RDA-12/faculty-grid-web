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
import { useCreateRank } from '@/lib/rank/rank.hook'
import {
  CreateRankSchema,
  type CreateRankRequest,
} from '@/lib/rank/rank.schema'
import { toast } from 'sonner'
import RankTypeSelector from './rank-type-selector'

/**
 * Creates Fieldset consists of Fields to create new rank
 */
export default function RankForm() {
  const { createRank, pendingCreation } = useCreateRank((_args, data) => {
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
  } = useForm<CreateRankRequest>({
    resolver: zodResolver(CreateRankSchema),
    defaultValues: {
      name: '',
      type: undefined,
    },
  })

  return (
    <FieldSet data-testid="RankForm">
      <form onSubmit={handleSubmit(createRank)}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="type">Jenis Pangkat/Golongan</FieldLabel>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RankTypeSelector
                  value={field.value ?? undefined}
                  onValueChange={field.onChange}
                />
              )}
            />
            {errors?.type && <FieldError>{errors.type?.message}</FieldError>}
          </Field>
          <Field>
            <FieldLabel htmlFor="name">Nama Pangkat/Golongan</FieldLabel>
            <Input
              id="name"
              aria-invalid={!!errors?.name}
              placeholder="Penata Muda (III/a)"
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
              Buat pangkat/golongan
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </FieldSet>
  )
}
