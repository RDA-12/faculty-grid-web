import { afterEach, describe, expect, it, vi } from 'vitest'
import { useFaculties } from './faculties.hook'
import type { PaginatedData } from '../common/pagination'
import type { Faculty } from './faculty.types'
import { getFacultiesQuery } from './faculties.query'
import { act, waitFor } from '@testing-library/react'
import { internalError } from '../../../test/mock/http-response/common.response'
import { renderHook } from '../../../test/rtl-helper'
import { DEFAULT_STALE_TIME } from '../common/config'

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
  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useFaculties', () => {
    const faculties: PaginatedData<Faculty> = {
      data: [{ id: 'id', name: 'name' }],
      pagination: {
        total: 1,
        page: 1,
        pageSize: 10,
      },
    }

    it('should have faculties set when initialState have it and not run getFacultiesQuery', () => {
      const { result } = renderHook(() => useFaculties({ data: faculties }))

      expect(result.current.faculties).toStrictEqual(faculties)
      expect(getFacultiesQuery).not.toHaveBeenCalled()
    })

    it('should have error set when initialState have it and not run getFacultiesQuery', async () => {
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
      expect(getFacultiesQuery).not.toHaveBeenCalled()
    })

    it('should runs getFacultiesQuery when initialState is empty', async () => {
      const { result } = renderHook(() => useFaculties())

      expect(getFacultiesQuery).toHaveBeenCalledOnce()
      await waitFor(() => expect(result.current.faculties).toBeTruthy())
    })

    it('should set isLoading to true and error to null when getFaculties invoked', async () => {
      // Auto invoked getFaculties
      const { result } = renderHook(() => useFaculties())
      expect(getFacultiesQuery).toHaveBeenCalledOnce()

      await waitFor(() => expect(result.current.isLoading).toBeTruthy())
      await waitFor(() => expect(result.current.error).toBeFalsy())
    })

    it('should return cached data when getFaculties invoked within staletime', async () => {
      const { result } = renderHook(() => useFaculties())
      await waitFor(() => expect(result.current.faculties).toBeTruthy())

      await act(async () => {
        await result.current.getFaculties()
      })
      await waitFor(() => expect(getFacultiesQuery).toHaveBeenCalledOnce())
    })

    it('should call getFacultiesQuery again after stale time has passed', async () => {
      const { result } = renderHook(() => useFaculties())
      await waitFor(() => expect(result.current.faculties).toBeTruthy())

      await act(async () => {
        await result.current.getFaculties()
      })
      expect(getFacultiesQuery).toHaveBeenCalledOnce()

      vi.useFakeTimers()

      await act(async () => {
        await vi.advanceTimersByTimeAsync(DEFAULT_STALE_TIME + 1000)
      })

      await act(async () => {
        await result.current.getFaculties()
      })

      expect(getFacultiesQuery).toHaveBeenCalledTimes(2)

      vi.useRealTimers()
    })

    it('should set error when getFacultiesQuery failed', async () => {
      vi.mocked(getFacultiesQuery).mockResolvedValueOnce({
        error: { ...internalError.error, status: 500 },
      })
      const { result } = renderHook(() => useFaculties())

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
