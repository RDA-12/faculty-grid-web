'use client'

import {
  useMutation,
  useMutationState,
  useQueryClient,
} from '@tanstack/react-query'
import type { CreateRankRequest } from './rank.schema'
import { createRankAction } from './rank.action'
import type { ActionState } from '../common/types'
import type { Rank } from './rank.types'

const RANKS_KEY = ['ranks'] as const

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
