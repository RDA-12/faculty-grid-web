'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { PaginatedData } from '../common/pagination'
import type { Faculty } from './faculty.types'
import {
  getFacultiesQuery,
  type GetFacultiesQueryResult,
} from './faculties.query'
import { ResponseError } from '../common/types'
import httpClient from '../common/http-client/http-client.browser'

export function useFaculties(initialState?: GetFacultiesQueryResult) {
  const [faculties, setFaculties] = useState<PaginatedData<Faculty> | null>(
    initialState?.data ?? null,
  )
  const [error, setError] = useState<ResponseError | null>(
    initialState?.error ?? null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const didFetchOnMount = useRef(false)

  const getFaculties = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const queryResult = await getFacultiesQuery(httpClient)
    setIsLoading(false)
    if (queryResult.error) {
      setError(queryResult.error)
    } else {
      setFaculties(queryResult.data!)
    }
  }, [])

  useEffect(() => {
    if (initialState && didFetchOnMount.current) return
    didFetchOnMount.current = true
    void getFaculties()
  }, [initialState, getFaculties])

  return { faculties, error, isLoading, getFaculties }
}
