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
  ProgramsQueryScheme,
  type ProgramsQueryParams,
} from '@/lib/programs/programs.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { createQueryString } from '@/lib/utils'
import AddProgramButton from './add-program-button'

type ProgramsSearchBarProps = {
  initialParams?: ProgramsQueryParams
}

export default function ProgramsSearchBar({
  initialParams,
}: ProgramsSearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ProgramsQueryScheme),
    defaultValues: initialParams,
  })
  const onSubmit = (params: ProgramsQueryParams) => {
    const newSearchParams = createQueryString(searchParams, [
      { key: 'page', value: '1' },
      { key: 'search', value: params.search ?? '' },
    ])
    router.push(`/dashboard/programs?${newSearchParams}`)
  }

  return (
    <div className="flex flex-row gap-2 shrink-0">
      <InputGroup>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
          <InputGroupInput
            id="search"
            aria-label="search"
            aria-invalid={!!errors?.search}
            placeholder="Sistem Informasi"
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
              reset({ search: '' })
              const pageSize = searchParams.get('pageSize') ?? ''
              router.push(`/dashboard/programs?pageSize=${pageSize}`)
            }}
          >
            Hapus
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <AddProgramButton />
    </div>
  )
}
