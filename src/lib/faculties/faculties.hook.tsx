'use client'

import {
  useQuery,
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  CreateFacultyRequest,
  FacultiesQueryParams,
} from './faculties.schema'
import {
  getFacultiesQuery,
  type GetFacultiesQueryResult,
} from './faculties.query'
import httpClient from '../common/http-client/http-client.browser'
import { createFacultyAction, deleteFacultyAction } from './faculties.action'
import type { ActionState } from '../common/types'
import type { Faculty } from './faculty.types'

const FACULTIES_KEY = ['faculties'] as const

export function useFaculties(
  initialState?: GetFacultiesQueryResult,
  params?: FacultiesQueryParams,
) {
  const { data, isFetching, refetch } = useQuery({
    queryKey: params ? [...FACULTIES_KEY, params] : FACULTIES_KEY,
    queryFn: () => getFacultiesQuery(httpClient, params),
    initialData: initialState,
  })

  return {
    faculties: data?.data ?? null,
    error: isFetching ? null : (data?.error ?? null),
    isLoading: isFetching,
    refresh: () => {
      void refetch()
    },
  }
}

export function useCreateFaculty(
  onSettled?: (
    vars: CreateFacultyRequest,
    res: ActionState<CreateFacultyRequest, Faculty>,
  ) => void,
) {
  const queryClient = useQueryClient()
  const mutationKey = ['create-faculty']

  const mutation = useMutation({
    mutationKey,
    mutationFn: (args: CreateFacultyRequest) => createFacultyAction(args),
    onSettled: async (data, error, variables) => {
      if (data && !data.error) {
        await queryClient.invalidateQueries({ queryKey: FACULTIES_KEY })
      }
      if (!onSettled) return
      if (data) onSettled(variables, data)
      if (error) {
        onSettled(variables, {
          error: { status: 500, title: 'Internal error', detail: `${error}` },
        })
      }
    },
  })

  const pendingCreation = useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: (m) => m.state.variables as CreateFacultyRequest,
  })

  return {
    createFaculty: (args: CreateFacultyRequest) => {
      mutation.mutate(args)
    },
    pendingCreation,
  }
}

export function useDeleteFaculty(
  onSettled?: (vars: Faculty, res: ActionState<string, boolean>) => void,
) {
  const queryClient = useQueryClient()
  const mutationKey = ['delete-faculty']

  const mutation = useMutation({
    mutationKey,
    mutationFn: (faculty: Faculty) => deleteFacultyAction(faculty.id),
    onSettled: async (data, error, variables) => {
      if (data && !data.error) {
        await queryClient.invalidateQueries({ queryKey: FACULTIES_KEY })
      }
      if (!onSettled) return
      if (data) onSettled(variables, data)
      if (error) {
        onSettled(variables, {
          error: { status: 500, title: 'Internal error', detail: `${error}` },
        })
      }
    },
  })

  const pendingDeletion = useMutationState({
    filters: { mutationKey, status: 'pending' },
    select: (m) => m.state.variables as Faculty,
  })

  return {
    deleteFaculty: (faculty: Faculty) => {
      mutation.mutate(faculty)
    },
    pendingDeletion,
  }
}
