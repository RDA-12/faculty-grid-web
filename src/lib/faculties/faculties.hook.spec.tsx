import { describe, expect, it, vi } from 'vitest'
import { useFaculties } from './faculties.hook'
import type { PaginatedData } from '../common/pagination'
import type { Faculty } from './faculty.types'
import {
  getFacultiesQuery,
  type GetFacultiesQueryResult,
} from './faculties.query'
import { act, renderHook } from '@testing-library/react'
import { internalError } from '../../../test/mock/http-response/common.response'

vi.mock('./faculties.query', () => ({
  getFacultiesQuery: vi.fn().mockResolvedValue({
    data: {
      data: [{ id: 'id', name: 'name' }],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
      },
    },
  }),
}))

describe('FacultiesHook', () => {
  describe('useFaculties', () => {
    const faculties: PaginatedData<Faculty> = {
      data: [{ id: 'id', name: 'name' }],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
      },
    }

    it('should have faculties set when initialState have it', () => {
      const { result } = renderHook(() => useFaculties({ data: faculties }))

      expect(result.current.faculties).toStrictEqual(faculties)
    })

    it('should have error set when initialState have it', () => {
      const { result } = renderHook(() =>
        useFaculties({
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
    })

    it('should have isLoading true and error null when getFaculties called', async () => {
      let resolve!: (_: GetFacultiesQueryResult) => void
      vi.mocked(getFacultiesQuery).mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r
          }),
      )

      const { result } = renderHook(() => useFaculties())
      expect(result.current.isLoading).toBeFalsy()
      expect(result.current.error).toBeFalsy()

      let getFacultiesResolve: Promise<void>
      act(() => {
        getFacultiesResolve = result.current.getFaculties()
      })
      expect(result.current.isLoading).toBeTruthy()

      await act(async () => {
        resolve({ data: faculties })
        await getFacultiesResolve
      })
      expect(result.current.isLoading).toBeFalsy()
    })

    it('should load faculties from getFacultiesQuery when it success', async () => {
      vi.mocked(getFacultiesQuery).mockResolvedValueOnce({ data: faculties })

      const { result } = renderHook(() => useFaculties())
      expect(result.current.faculties).toBeNull()

      await act(async () => {
        await result.current.getFaculties()
      })

      expect(result.current.faculties).toStrictEqual(faculties)
    })

    it('should load error when getFacultiesQuery failed', async () => {
      vi.mocked(getFacultiesQuery).mockResolvedValueOnce({
        error: {
          status: 500,
          ...internalError.error,
        },
      })

      const { result } = renderHook(() => useFaculties())
      expect(result.current.error).toBeNull()

      await act(async () => {
        await result.current.getFaculties()
      })

      expect(result.current.error).toStrictEqual({
        status: 500,
        ...internalError.error,
      })
    })
  })
})
