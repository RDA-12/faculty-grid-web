import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useCreateFaculty,
  useDeleteFaculty,
  useFaculties,
} from './faculties.hook'
import type { PaginatedData } from '../common/pagination'
import type { Faculty } from './faculty.types'
import {
  getFacultiesQuery,
  type GetFacultiesQueryResult,
} from './faculties.query'
import { act, waitFor } from '@testing-library/react'
import { internalError } from '../../../test/mock/http-response/common.response'
import { renderHook } from '../../../test/rtl-helper'
import { createFacultyAction, deleteFacultyAction } from './faculties.action'
import type { CreateFacultyRequest } from './faculties.schema'
import type { ActionState } from '../common/types'

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
vi.mock('./faculties.action', () => ({
  createFacultyAction: vi.fn().mockResolvedValue({
    data: { id: 'id', name: 'name' },
  }),
  deleteFacultyAction: vi.fn().mockResolvedValue({
    data: true,
  }),
}))

describe('FacultiesHook', () => {
  const faculties: PaginatedData<Faculty> = {
    data: [{ id: 'id', name: 'name' }],
    pagination: {
      total: 1,
      page: 1,
      pageSize: 10,
    },
  }

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('useFaculties', () => {
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

    it('should runs getFacultiesQuery when initialState is empty with correct params', async () => {
      const { result } = renderHook(() =>
        useFaculties(undefined, { search: 'lol' }),
      )

      expect(getFacultiesQuery).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        { search: 'lol' },
      )
      await waitFor(() => expect(result.current.faculties).toBeTruthy())
    })

    describe('refresh', () => {
      it('should set isLoading to true and error to null when refresh invoked', async () => {
        let resolve: (v: GetFacultiesQueryResult) => void
        vi.mocked(getFacultiesQuery).mockImplementationOnce(
          () =>
            new Promise((r) => {
              resolve = r
            }),
        )
        const { result } = renderHook(() =>
          useFaculties({ error: { status: 500, ...internalError.error } }),
        )
        await waitFor(() => expect(result.current.isLoading).toBeFalsy())
        await waitFor(() => expect(result.current.error).toBeTruthy())

        result.current.refresh()

        await waitFor(() => expect(result.current.isLoading).toBeTruthy())
        await waitFor(() => expect(result.current.error).toBeFalsy())

        await act(async () => {
          resolve({ data: faculties })
        })

        await waitFor(() => expect(result.current.isLoading).toBeFalsy())
        await waitFor(() => expect(result.current.error).toBeFalsy())
      })

      it('should calls getFacultiesQuery once', async () => {
        const { result } = renderHook(() => useFaculties())
        await waitFor(() => expect(result.current.faculties).toBeTruthy())

        result.current.refresh()

        await waitFor(() => expect(getFacultiesQuery).toHaveBeenCalledTimes(2))
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

  describe('useCreateFaculty', () => {
    it('should calls createFacultyAction once', async () => {
      const { result } = renderHook(() => useCreateFaculty())

      result.current.createFaculty({ name: 'new faculty' })

      await waitFor(() =>
        expect(createFacultyAction).toHaveBeenCalledExactlyOnceWith({
          name: 'new faculty',
        }),
      )
    })

    it('should calls onCreateSettled when success', async () => {
      const expectedData: ActionState<CreateFacultyRequest, Faculty> = {
        data: {
          id: 'id',
          name: 'new faculty',
        },
      }
      vi.mocked(createFacultyAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: CreateFacultyRequest = {
        name: 'new faculty',
      }
      let receivedArgs: CreateFacultyRequest
      let receivedData: ActionState<CreateFacultyRequest, Faculty>
      const { result } = renderHook(() =>
        useCreateFaculty((args, data) => {
          receivedArgs = args
          receivedData = data
        }),
      )

      result.current.createFaculty(expectedArgs)

      await waitFor(() => expect(receivedArgs).toStrictEqual(expectedArgs))
      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should calls onCreateSettled when failed', async () => {
      const expectedData: ActionState<CreateFacultyRequest, Faculty> = {
        error: {
          status: 500,
          ...internalError.error,
        },
      }
      vi.mocked(createFacultyAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: CreateFacultyRequest = {
        name: 'new faculty',
      }
      let receivedArgs: CreateFacultyRequest
      let receivedData: ActionState<CreateFacultyRequest, Faculty>
      const { result } = renderHook(() =>
        useCreateFaculty((args, data) => {
          receivedArgs = args
          receivedData = data
        }),
      )

      result.current.createFaculty(expectedArgs)

      await waitFor(() => expect(receivedArgs).toStrictEqual(expectedArgs))
      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should update pendingCreation list when called', async () => {
      let resolve!: (v: ActionState<CreateFacultyRequest, Faculty>) => void
      vi.mocked(createFacultyAction).mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r
          }),
      )
      const { result } = renderHook(() => useCreateFaculty())

      expect(result.current.pendingCreation.length).toBe(0)

      result.current.createFaculty({ name: 'new name' })

      await waitFor(() => expect(result.current.pendingCreation.length).toBe(1))

      await act(async () => {
        resolve({ data: faculties.data[0]! })
      })

      await waitFor(() => expect(result.current.pendingCreation.length).toBe(0))
    })

    it('should call getFacultiesQuery once when success', async () => {
      renderHook(() => useFaculties())
      const { result } = renderHook(() => useCreateFaculty())

      result.current.createFaculty({ name: 'new name' })

      await waitFor(() => expect(getFacultiesQuery).toHaveBeenCalledOnce())
    })
  })

  describe('useDeleteFaculty', () => {
    it('should calls deleteFacultyAction once', async () => {
      const { result } = renderHook(() => useDeleteFaculty())

      result.current.deleteFaculty(faculties.data[0])

      await waitFor(() =>
        expect(deleteFacultyAction).toHaveBeenCalledExactlyOnceWith(
          faculties.data[0].id,
        ),
      )
    })

    it('should calls onDeleteSettled when success', async () => {
      const expectedData: ActionState<string, boolean> = {
        data: true,
      }
      vi.mocked(deleteFacultyAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: Faculty = faculties.data[0]
      let receivedArgs: Faculty
      let receivedData: ActionState<string, boolean>
      const { result } = renderHook(() =>
        useDeleteFaculty((args, data) => {
          receivedArgs = args
          receivedData = data
        }),
      )

      result.current.deleteFaculty(expectedArgs)

      await waitFor(() => expect(receivedArgs).toStrictEqual(expectedArgs))
      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should calls onDeleteSettled when failed', async () => {
      const expectedData: ActionState<string, boolean> = {
        error: {
          status: 500,
          ...internalError.error,
        },
      }
      vi.mocked(deleteFacultyAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: Faculty = faculties.data[0]
      let receivedArgs: Faculty
      let receivedData: ActionState<string, boolean>
      const { result } = renderHook(() =>
        useDeleteFaculty((args, data) => {
          receivedArgs = args
          receivedData = data
        }),
      )

      result.current.deleteFaculty(expectedArgs)

      await waitFor(() => expect(receivedArgs).toStrictEqual(expectedArgs))
      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should update pendingDeletion list when called', async () => {
      let resolve!: (v: ActionState<string, boolean>) => void
      vi.mocked(deleteFacultyAction).mockImplementationOnce(
        () =>
          new Promise((r) => {
            resolve = r
          }),
      )
      const { result } = renderHook(() => useDeleteFaculty())

      expect(result.current.pendingDeletion.length).toBe(0)

      result.current.deleteFaculty(faculties.data[0])

      await waitFor(() => expect(result.current.pendingDeletion.length).toBe(1))

      await act(async () => {
        resolve({ data: true })
      })

      await waitFor(() => expect(result.current.pendingDeletion.length).toBe(0))
    })

    it('should call getFacultiesQuery once when success', async () => {
      // Ensure useQuery with faculties key is subscribed
      // So it triggers the query when invalidated
      renderHook(() => useFaculties())
      const { result } = renderHook(() => useDeleteFaculty())

      result.current.deleteFaculty(faculties.data[0])

      await waitFor(() => expect(getFacultiesQuery).toHaveBeenCalledOnce())
    })
  })
})
