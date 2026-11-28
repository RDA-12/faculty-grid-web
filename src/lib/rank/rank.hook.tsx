'use client'

import {
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import type { CreateRankRequest, RanksQueryParams } from './rank.schema'
import { createRankAction } from './rank.action'
import { getRanksQuery, type GetRanksQueryResult } from './rank.query'
import httpClient from '../common/http-client/http-client.browser'
import type { ActionState } from '../common/types'
import type { Rank } from './rank.types'

const RANKS_KEY = ['ranks'] as const

export function useRanks(
  initialState?: GetRanksQueryResult,
  params?: RanksQueryParams,
) {
  const { data, isFetching, refetch } = useQuery({
    queryKey: params ? [...RANKS_KEY, params] : RANKS_KEY,
    queryFn: () => getRanksQuery(httpClient, params),
    initialData: initialState,
  })

  return {
    ranks: data?.data ?? null,
    error: isFetching ? null : (data?.error ?? null),
    isLoading: isFetching,
    refresh: () => {
      void refetch()
    },
  }
}

export function useCreateRank(
  onSettled?: (
    vars: CreateRankRequest,
    res: ActionState<CreateRankRequest, Rank>,
  ) => void,
) {
  const queryClient = useQueryClient()
  const mutationKey = ['create-rank']

  const mutation = useMutation({
    mutationKey,
    mutationFn: (args: CreateRankRequest) => createRankAction(args),
    onSettled: async (data, error, variables) => {
      if (data && !data.error) {
        await queryClient.invalidateQueries({ queryKey: RANKS_KEY })
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
    select: (m) => m.state.variables as CreateRankRequest,
  })

  return {
    createRank: (args: CreateRankRequest) => {
      mutation.mutate(args)
    },
    pendingCreation,
  }
}
