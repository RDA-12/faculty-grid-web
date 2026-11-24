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

type FacultiesListProps = {
  initial?: GetFacultiesQueryResult
}

export default function FacultiesList({ initial }: FacultiesListProps) {
  const { faculties, error, isLoading, getFaculties } = useFaculties(initial)

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
          <Button onClick={getFaculties}>Coba lagi</Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <FacultiesTable faculties={faculties?.data ?? []} />
}
