'use client'

import {
  getFacultiesQuery,
  type GetFacultiesQueryResult,
} from './faculties.query'
import httpClient from '../common/http-client/http-client.browser'
import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createFacultyAction, deleteFacultyAction } from './faculties.action'
import type { CreateFacultyRequest } from './faculties.schema'
import type { ActionState } from '../common/types'
import type { Faculty } from './faculty.types'

type UseFacultiesSideEffect = {
  /**
   * Invoked when a createFaculty finished
   *
   * NOTE: DO NOT update useState within this callback.
   */
  onCreateSettled?: (
    args: CreateFacultyRequest,
    data: ActionState<CreateFacultyRequest, Faculty>,
  ) => void
  /**
   * Invoked when a deleteFaculty finished
   *
   * NOTE: DO NOT update useState within this callback.
   */
  onDeleteSettled?: (
    faculty: Faculty,
    data: ActionState<string, boolean>,
  ) => void
}

/**
 * Hook to manage faculties data
 *
 * The faculties will be fetched automatically and will be updated when needed.
 * E.g. when createFaculty is success and user on last page
 */
export function useFaculties(
  initialState?: GetFacultiesQueryResult,
  effect?: UseFacultiesSideEffect,
) {
  const queryClient = useQueryClient()

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['faculties'],
    queryFn: async () => {
      return getFacultiesQuery(httpClient)
    },
    initialData: initialState,
  })

  const createMutationKey = ['create-faculty']
  const createMutation = useMutation({
    mutationKey: createMutationKey,
    mutationFn: async (args: CreateFacultyRequest) => {
      return createFacultyAction(args)
    },
    onSettled: async (data, error, variables) => {
      if (data && !data.error) {
        await queryClient.invalidateQueries({
          queryKey: ['faculties'],
        })
        if (!effect?.onCreateSettled) return
        if (data) {
          effect.onCreateSettled(variables, data)
        }
        if (error) {
          effect.onCreateSettled(variables, {
            error: {
              status: 500,
              title: 'Internal error',
              detail: `${error}`,
            },
          })
        }
      }
    },
  })
  const pendingCreation = useMutationState({
    filters: { mutationKey: createMutationKey, status: 'pending' },
    select: (mutation) => mutation.state.variables as CreateFacultyRequest,
  })
  const createFaculty = (args: CreateFacultyRequest) => {
    createMutation.mutate(args)
  }

  const deleteMutationKey = ['delete-faculty']
  const deleteMutation = useMutation({
    mutationKey: deleteMutationKey,
    mutationFn: (faculty: Faculty) => {
      return deleteFacultyAction(faculty.id)
    },
    onSettled: async (data, error, variables) => {
      if (data && !data.error) {
        await queryClient.invalidateQueries({
          queryKey: ['faculties'],
        })
      }
      if (!effect?.onDeleteSettled) return
      if (data) {
        effect.onDeleteSettled(variables, data)
      }
      if (error) {
        effect.onDeleteSettled(variables, {
          error: {
            status: 500,
            title: 'Internal error',
            detail: `${error}`,
          },
        })
      }
    },
  })
  const pendingDeletion = useMutationState({
    filters: { mutationKey: deleteMutationKey, status: 'pending' },
    select: (mutation) => mutation.state.variables as Faculty,
  })
  const deleteFaculty = (faculty: Faculty) => {
    deleteMutation.mutate(faculty)
  }

  return {
    faculties: data?.data ?? null,
    error: isFetching ? null : (data?.error ?? null),
    isLoading: isFetching,
    refresh: () => {
      void refetch()
    },
    createFaculty,
    pendingCreation,
    deleteFaculty,
    pendingDeletion,
  }
}
