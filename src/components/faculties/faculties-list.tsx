'use client'

import FacultiesTable from './faculties-table'
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
import type { GetFacultiesQueryResult } from '@/lib/faculties/faculties.query'
import { useFaculties } from '@/lib/faculties/faculties.hook'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { FacultiesQueryParams } from '@/lib/faculties/faculties.schema'

type FacultiesListProps = {
  initial?: GetFacultiesQueryResult
  params?: FacultiesQueryParams
}

export default function FacultiesList({ initial, params }: FacultiesListProps) {
  const router = useRouter()
  const { faculties, error, isLoading, refresh } = useFaculties(initial, params)

  useEffect(() => {
    if (error?.status !== 401) return
    router.replace('/api/auth/logout')
  }, [error, router])

  if (isLoading) {
    return <Spinner className="size-16" />
  }

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

  return <FacultiesTable faculties={faculties?.data ?? []} />
}
