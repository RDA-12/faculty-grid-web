'use client'

import {
  useQuery,
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'
import type {
  CreateProgramRequest,
  ProgramsQueryParams,
} from './programs.schema'
import { getProgramsQuery, type GetProgramsQueryResult } from './programs.query'
import httpClient from '../common/http-client/http-client.browser'
import { createProgramAction, deleteProgramAction } from './programs.action'
import type { ActionState } from '../common/types'
import type { Program } from './program.types'

const PROGRAMS_KEY = ['programs'] as const

export function usePrograms(
  initialState?: GetProgramsQueryResult,
  params?: ProgramsQueryParams,
) {
  const { data, isFetching, refetch } = useQuery({
    queryKey: params ? [...PROGRAMS_KEY, params] : PROGRAMS_KEY,
    queryFn: () => getProgramsQuery(httpClient, params),
    initialData: initialState,
  })

  return {
    programs: data?.data ?? null,
    error: isFetching ? null : (data?.error ?? null),
    isLoading: isFetching,
    refresh: () => {
      void refetch()
    },
  }
}

export function useCreateProgram(
  onSettled?: (
    vars: CreateProgramRequest,
    res: ActionState<CreateProgramRequest, Program>,
  ) => void,
) {
  const queryClient = useQueryClient()
  const mutationKey = ['create-program']

  const mutation = useMutation({
    mutationKey,
    mutationFn: (args: CreateProgramRequest) => createProgramAction(args),
    onSettled: async (data, error, variables) => {
      if (data && !data.error) {
        await queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY })
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
    select: (m) => m.state.variables as CreateProgramRequest,
  })

  return {
    createProgram: (args: CreateProgramRequest) => {
      mutation.mutate(args)
    },
    pendingCreation,
  }
}

export function useDeleteProgram(
  onSettled?: (vars: Program, res: ActionState<string, boolean>) => void,
) {
  const queryClient = useQueryClient()
  const mutationKey = ['delete-program']

  const mutation = useMutation({
    mutationKey,
    mutationFn: (program: Program) => deleteProgramAction(program.id),
    onSettled: async (data, error, variables) => {
      if (data && !data.error) {
        await queryClient.invalidateQueries({ queryKey: PROGRAMS_KEY })
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
    select: (m) => m.state.variables as Program,
  })

  return {
    deleteProgram: (program: Program) => {
      mutation.mutate(program)
    },
    pendingDeletion,
  }
}
