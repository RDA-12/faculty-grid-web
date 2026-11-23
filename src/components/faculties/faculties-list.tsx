'use client'

import {
  getFacultiesQuery,
  type getFacultiesQueryResult,
} from '@/lib/faculties/faculties.query'
import { startTransition, useActionState } from 'react'
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

type FacultiesListProps = {
  initial?: getFacultiesQueryResult
}

export default function FacultiesList({ initial }: FacultiesListProps) {
  const [state, action, isPending] = useActionState(
    getFacultiesQuery,
    initial ?? {},
  )

  if (isPending) {
    return <Spinner className="size-16" />
  }

  if (state.error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant={'icon'}>
            <CircleX />
          </EmptyMedia>
          <EmptyTitle>{state.error.title}</EmptyTitle>
          <EmptyDescription>{state.error.detail}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            onClick={() => {
              startTransition(() => {
                action()
              })
            }}
          >
            Coba lagi
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return <FacultiesTable faculties={state.data?.data ?? []} />
}
