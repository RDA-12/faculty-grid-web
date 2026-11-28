import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCreateRank, useRanks } from './rank.hook'
import type { PaginatedData } from '../common/pagination'
import { RankType, type Rank } from './rank.types'
import { getRanksQuery, type GetRanksQueryResult } from './rank.query'
import { internalError } from '../../../test/mock/http-response/common.response'
import { act, renderHook, waitFor } from '../../../test/rtl-helper'
import { createRankAction } from './rank.action'
import type { CreateRankRequest } from './rank.schema'
import type { ActionState } from '../common/types'

vi.mock('./rank.query', () => ({
  getRanksQuery: vi.fn().mockResolvedValue({
    data: {
      data: [
        {
          id: 'id',
          name: 'Penata Muda (III/a)',
          type: 'asn',
        },
      ],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
      },
    },
  }),
}))
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
  const ranks: PaginatedData<Rank> = {
    data: [
      {
        id: 'id',
        name: 'Penata Muda (III/a)',
        type: RankType.asn,
      },
    ],
    pagination: {
      total: 1,
      page: 1,
      pageSize: 10,
    },
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useRanks', () => {
    it('should have ranks set when initialState have it and not run getRanksQuery', () => {
      const { result } = renderHook(() => useRanks({ data: ranks }))

      expect(result.current.ranks).toStrictEqual(ranks)
      expect(getRanksQuery).not.toHaveBeenCalled()
    })

    it('should have error set when initialState have it and not run getRanksQuery', async () => {
      const { result } = renderHook(() =>
        useRanks({
          error: {
            status: 500,
            ...internalError.error,
          },
        }),
      )

      expect(result.current.error).toStrictEqual({
        status: 500,
        ...internalError.error,
      })
      expect(getRanksQuery).not.toHaveBeenCalled()
    })

    it('should run getRanksQuery when initialState is empty', async () => {
      const { result } = renderHook(() => useRanks())

      expect(getRanksQuery).toHaveBeenCalledOnce()
      await waitFor(() => expect(result.current.ranks).toBeTruthy())
    })

    it('should run getRanksQuery when initialState is empty with correct params', async () => {
      const { result } = renderHook(() =>
        useRanks(undefined, { search: 'penata', type: RankType.asn }),
      )

      expect(getRanksQuery).toHaveBeenCalledExactlyOnceWith(expect.anything(), {
        search: 'penata',
        type: RankType.asn,
      })
      await waitFor(() => expect(result.current.ranks).toBeTruthy())
    })

    describe('refresh', () => {
      it('should set isLoading to true and error to null when refresh invoked', async () => {
        let resolve: (v: GetRanksQueryResult) => void
        vi.mocked(getRanksQuery).mockImplementationOnce(
          () =>
            new Promise((r) => {
              resolve = r
            }),
        )
        const { result } = renderHook(() =>
          useRanks({ error: { status: 500, ...internalError.error } }),
        )
        await waitFor(() => expect(result.current.isLoading).toBeFalsy())
        await waitFor(() => expect(result.current.error).toBeTruthy())

        result.current.refresh()

        await waitFor(() => expect(result.current.isLoading).toBeTruthy())
        await waitFor(() => expect(result.current.error).toBeFalsy())

        await act(async () => {
          resolve({ data: ranks })
        })

        await waitFor(() => expect(result.current.isLoading).toBeFalsy())
        await waitFor(() => expect(result.current.error).toBeFalsy())
      })

      it('should call getRanksQuery once', async () => {
        const { result } = renderHook(() => useRanks())
        await waitFor(() => expect(result.current.ranks).toBeTruthy())

        result.current.refresh()

        await waitFor(() => expect(getRanksQuery).toHaveBeenCalledTimes(2))
      })

      it('should set error when getRanksQuery failed', async () => {
        vi.mocked(getRanksQuery).mockResolvedValueOnce({
          error: { ...internalError.error, status: 500 },
        })
        const { result } = renderHook(() => useRanks())

        await waitFor(() => expect(result.current.isLoading).toBeFalsy())
        await waitFor(() =>
          expect(result.current.error).toStrictEqual({
            ...internalError.error,
            status: 500,
          }),
        )
      })
    })
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
