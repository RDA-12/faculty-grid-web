'use client'

import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group'
import { useForm } from 'react-hook-form'
import {
  FacultiesQueryScheme,
  type FacultiesQueryParams,
} from '@/lib/faculties/faculties.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { createQueryString } from '@/lib/utils'
import AddFacultyButton from './add-faculty-button'

type FacultiesSearchBarProps = {
  initialParams?: FacultiesQueryParams
}

export default function FacultiesSearchBar({
  initialParams,
}: FacultiesSearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(FacultiesQueryScheme),
    defaultValues: initialParams,
  })
  const onSubmit = (params: FacultiesQueryParams) => {
    const newSearchParams = createQueryString(searchParams, [
      { key: 'page', value: '1' },
      { key: 'search', value: params.search ?? '' },
    ])
    router.push(`/dashboard/faculties?${newSearchParams}`)
  }

  return (
    <div className="flex flex-row gap-2">
      <InputGroup>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
          <InputGroupInput
            id="search"
            aria-label="search"
            aria-invalid={!!errors?.search}
            placeholder="Fakultas Teknik"
            {...register('search')}
          />
        </form>
        <InputGroupAddon align={'inline-start'}>
          <Search />
        </InputGroupAddon>
        <InputGroupAddon align={'inline-end'}>
          <InputGroupButton
            type="button"
            onClick={() => {
              reset()
              const pageSize = searchParams.get('pageSize') ?? ''
              router.push(`/dashboard/faculties?pageSize=${pageSize}`)
            }}
          >
            Hapus
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <AddFacultyButton />
    </div>
  )
}
