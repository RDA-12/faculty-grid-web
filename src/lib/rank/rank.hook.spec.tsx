import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCreateRank } from './rank.hook'
import { RankType, type Rank } from './rank.types'
import { act, waitFor } from '@testing-library/react'
import { internalError } from '../../../test/mock/http-response/common.response'
import { renderHook } from '../../../test/rtl-helper'
import { createRankAction } from './rank.action'
import type { CreateRankRequest } from './rank.schema'
import type { ActionState } from '../common/types'

vi.mock('./rank.action', () => ({
  createRankAction: vi.fn().mockResolvedValue({
    data: {
      id: 'id',
      name: 'Penata Muda (III/a)',
      type: 'asn',
    },
  }),
}))

describe('RankHook', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useCreateRank', () => {
    it('should call createRankAction once', async () => {
      const { result } = renderHook(() => useCreateRank())

      result.current.createRank({
        name: 'new rank',
        type: RankType.asn,
      })

      await waitFor(() =>
        expect(createRankAction).toHaveBeenCalledExactlyOnceWith({
          name: 'new rank',
          type: RankType.asn,
        }),
      )
    })

    it('should call onSettled when success', async () => {
      const expectedData: ActionState<CreateRankRequest, Rank> = {
        data: {
          id: 'id',
          name: 'new rank',
          type: RankType.asn,
        },
      }
      vi.mocked(createRankAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: CreateRankRequest = {
        name: 'new rank',
        type: RankType.asn,
      }
      let receivedArgs: CreateRankRequest
      let receivedData: ActionState<CreateRankRequest, Rank>
      const { result } = renderHook(() =>
        useCreateRank((args, data) => {
          receivedArgs = args
          receivedData = data
        }),
      )

      result.current.createRank(expectedArgs)

      await waitFor(() => expect(receivedArgs).toStrictEqual(expectedArgs))
      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should call onSettled when failed', async () => {
      const expectedData: ActionState<CreateRankRequest, Rank> = {
        error: {
          status: 500,
          ...internalError.error,
        },
      }
      vi.mocked(createRankAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: CreateRankRequest = {
        name: 'new rank',
        type: RankType.asn,
      }
      let receivedData: ActionState<CreateRankRequest, Rank>
      const { result } = renderHook(() =>
        useCreateRank((_args, data) => {
          receivedData = data
        }),
      )

      result.current.createRank(expectedArgs)

      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should track pendingCreation while mutation is pending', async () => {
      let resolve!: (v: ActionState<CreateRankRequest, Rank>) => void
      vi.mocked(createRankAction).mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r
          }),
      )

      const request: CreateRankRequest = {
        name: 'Penata Muda (III/a)',
        type: RankType.asn,
      }
      const { result } = renderHook(() => useCreateRank())

      expect(result.current.pendingCreation).toStrictEqual([])

      act(() => {
        result.current.createRank(request)
      })

      await waitFor(() =>
        expect(result.current.pendingCreation).toStrictEqual([request]),
      )

      await act(async () => {
        resolve({
          data: {
            id: 'id',
            ...request,
          },
        })
      })

      await waitFor(() =>
        expect(result.current.pendingCreation).toStrictEqual([]),
      )
    })
  })
})
