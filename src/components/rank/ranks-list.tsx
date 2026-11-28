'use client'

import RanksTable from './ranks-table'
import { Spinner } from '../ui/spinner'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '../ui/empty'
import { CircleX } from 'lucide-react'
import { Button } from '../ui/button'
import type { GetRanksQueryResult } from '@/lib/rank/rank.query'
import { useRanks } from '@/lib/rank/rank.hook'
import { useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { RanksQueryParams } from '@/lib/rank/rank.schema'
import { Field, FieldLabel } from '../ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '../ui/pagination'
import { createQueryString } from '@/lib/utils'
import type { Route } from 'next'

type RanksListProps = {
  initial?: GetRanksQueryResult
  params?: RanksQueryParams
}

export default function RanksList({ initial, params }: RanksListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { ranks, error, refresh } = useRanks(initial, params)

  const nextPageLink = useCallback(() => {
    if (!ranks?.pagination) return null
    if (
      ranks.pagination.total / ranks.pagination.pageSize <=
      ranks.pagination.page
    )
      return null
    const newParams = createQueryString(searchParams, [
      { key: 'page', value: (ranks.pagination.page + 1).toString() },
    ])
    return `/dashboard/ranks?${newParams}` satisfies Route
  }, [ranks, searchParams])

  const prevPageLink = useCallback(() => {
    if (!ranks?.pagination) return null
    if (ranks.pagination.page <= 1) return null
    const newParams = createQueryString(searchParams, [
      { key: 'page', value: (ranks.pagination.page - 1).toString() },
    ])
    return `/dashboard/ranks?${newParams}` satisfies Route
  }, [ranks, searchParams])

  useEffect(() => {
    if (error?.status !== 401) return
    router.replace('/api/auth/logout')
  }, [error, router])

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant={'icon'}>
            <CircleX />
          </EmptyMedia>
          <EmptyTitle>{error.title}</EmptyTitle>
          <EmptyDescription>{error.detail}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={refresh}>Coba lagi</Button>
        </EmptyContent>
      </Empty>
    )
  }

  if (ranks) {
    return (
      <div className="flex-1 flex flex-col gap-4 min-h-0">
        <RanksTable ranks={ranks.data} />
        <div className="flex flex-row justify-end gap-4 shrink-0">
          <Field orientation="horizontal" className="w-fit">
            <FieldLabel htmlFor="select-rows-per-page">
              Data per halaman
            </FieldLabel>
            <Select
              defaultValue="10"
              value={ranks.pagination.pageSize.toString()}
              onValueChange={(v) => {
                const newParams = createQueryString(searchParams, [
                  {
                    key: 'page',
                    value: '1',
                  },
                  {
                    key: 'pageSize',
                    value: v,
                  },
                ])
                router.push(`/dashboard/ranks?${newParams}`)
              }}
            >
              <SelectTrigger className="w-20" id="select-rows-per-page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectGroup>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href={prevPageLink()} text="Sebelumnya" />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href={nextPageLink()} text="Selanjutnya" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center gap-4 min-h-0">
      <Spinner className="size-16" />
    </div>
  )
}
