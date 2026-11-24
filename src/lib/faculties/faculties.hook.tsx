'use client'

import {
  getFacultiesQuery,
  type GetFacultiesQueryResult,
} from './faculties.query'
import httpClient from '../common/http-client/http-client.browser'
import { useQuery, useQueryClient } from '@tanstack/react-query'

export function useFaculties(initialState?: GetFacultiesQueryResult) {
  const queryClient = useQueryClient()

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['faculties'],
    queryFn: async () => {
      return getFacultiesQuery(httpClient)
    },
    initialData: initialState,
  })

  return {
    faculties: data?.data ?? null,
    error: data?.error ?? null,
    isLoading: isFetching,
    getFaculties: async (force: boolean = false) => {
      if (force) {
        await refetch()
        return
      }
      await queryClient.query({
        queryKey: ['faculties'],
        queryFn: async () => {
          const result = await getFacultiesQuery(httpClient)
          if (result.error) {
            throw result.error
          }
          return result
        },
        initialData: initialState,
      })
    },
  }
}
