'use client'

import { Search } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '../ui/input-group'
import { useForm } from 'react-hook-form'
import { RanksQueryScheme, type RanksQueryParams } from '@/lib/rank/rank.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { createQueryString } from '@/lib/utils'
import AddRankButton from './add-rank-button'

type RanksSearchBarProps = {
  initialParams?: RanksQueryParams
}

export default function RanksSearchBar({ initialParams }: RanksSearchBarProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(RanksQueryScheme),
    defaultValues: initialParams,
  })
  const onSubmit = (params: RanksQueryParams) => {
    const newSearchParams = createQueryString(searchParams, [
      { key: 'page', value: '1' },
      { key: 'search', value: params.search ?? '' },
    ])
    router.push(`/dashboard/ranks?${newSearchParams}`)
  }

  return (
    <div className="flex flex-row gap-2 shrink-0">
      <InputGroup>
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1">
          <InputGroupInput
            id="search"
            aria-label="search"
            aria-invalid={!!errors?.search}
            placeholder="Penata Muda (III/a)"
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
              router.push(`/dashboard/ranks?pageSize=${pageSize}`)
            }}
          >
            Hapus
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <AddRankButton />
    </div>
  )
}
