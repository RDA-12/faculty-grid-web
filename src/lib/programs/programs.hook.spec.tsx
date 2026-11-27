import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useCreateProgram,
  useDeleteProgram,
  usePrograms,
} from './programs.hook'
import type { PaginatedData } from '../common/pagination'
import { ProgramDegreeLevel, type Program } from './program.types'
import { getProgramsQuery, type GetProgramsQueryResult } from './programs.query'
import { act, waitFor } from '@testing-library/react'
import { internalError } from '../../../test/mock/http-response/common.response'
import { renderHook } from '../../../test/rtl-helper'
import { createProgramAction, deleteProgramAction } from './programs.action'
import type { CreateProgramRequest } from './programs.schema'
import type { ActionState } from '../common/types'

vi.mock('./programs.query', () => ({
  getProgramsQuery: vi.fn().mockResolvedValue({
    data: {
      data: [
        {
          id: 'id',
          name: 'name',
          degreeLevel: 'bachelor',
          facultyId: 'faculty-id',
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
vi.mock('./programs.action', () => ({
  createProgramAction: vi.fn().mockResolvedValue({
    data: {
      id: 'id',
      name: 'name',
      degreeLevel: 'bachelor',
      facultyId: 'faculty-id',
    },
  }),
  deleteProgramAction: vi.fn().mockResolvedValue({
    data: true,
  }),
}))

describe('ProgramsHook', () => {
  const programs: PaginatedData<Program> = {
    data: [
      {
        id: 'id',
        name: 'name',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'faculty-id',
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

  describe('usePrograms', () => {
    it('should have programs set when initialState have it and not run getProgramsQuery', () => {
      const { result } = renderHook(() => usePrograms({ data: programs }))

      expect(result.current.programs).toStrictEqual(programs)
      expect(getProgramsQuery).not.toHaveBeenCalled()
    })

    it('should have error set when initialState have it and not run getProgramsQuery', async () => {
      const { result } = renderHook(() =>
        usePrograms({
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
      expect(getProgramsQuery).not.toHaveBeenCalled()
    })

    it('should run getProgramsQuery when initialState is empty', async () => {
      const { result } = renderHook(() => usePrograms())

      expect(getProgramsQuery).toHaveBeenCalledOnce()
      await waitFor(() => expect(result.current.programs).toBeTruthy())
    })

    it('should run getProgramsQuery when initialState is empty with correct params', async () => {
      const { result } = renderHook(() =>
        usePrograms(undefined, { search: 'informatika', facultyId: 'fac-1' }),
      )

      expect(getProgramsQuery).toHaveBeenCalledExactlyOnceWith(
        expect.anything(),
        { search: 'informatika', facultyId: 'fac-1' },
      )
      await waitFor(() => expect(result.current.programs).toBeTruthy())
    })

    describe('refresh', () => {
      it('should set isLoading to true and error to null when refresh invoked', async () => {
        let resolve: (v: GetProgramsQueryResult) => void
        vi.mocked(getProgramsQuery).mockImplementationOnce(
          () =>
            new Promise((r) => {
              resolve = r
            }),
        )
        const { result } = renderHook(() =>
          usePrograms({ error: { status: 500, ...internalError.error } }),
        )
        await waitFor(() => expect(result.current.isLoading).toBeFalsy())
        await waitFor(() => expect(result.current.error).toBeTruthy())

        result.current.refresh()

        await waitFor(() => expect(result.current.isLoading).toBeTruthy())
        await waitFor(() => expect(result.current.error).toBeFalsy())

        await act(async () => {
          resolve({ data: programs })
        })

        await waitFor(() => expect(result.current.isLoading).toBeFalsy())
        await waitFor(() => expect(result.current.error).toBeFalsy())
      })

      it('should call getProgramsQuery once', async () => {
        const { result } = renderHook(() => usePrograms())
        await waitFor(() => expect(result.current.programs).toBeTruthy())

        result.current.refresh()

        await waitFor(() => expect(getProgramsQuery).toHaveBeenCalledTimes(2))
      })

      it('should set error when getProgramsQuery failed', async () => {
        vi.mocked(getProgramsQuery).mockResolvedValueOnce({
          error: { ...internalError.error, status: 500 },
        })
        const { result } = renderHook(() => usePrograms())

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

  describe('useCreateProgram', () => {
    it('should call createProgramAction once', async () => {
      const { result } = renderHook(() => useCreateProgram())

      result.current.createProgram({
        name: 'new program',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'fac-1',
      })

      await waitFor(() =>
        expect(createProgramAction).toHaveBeenCalledExactlyOnceWith({
          name: 'new program',
          degreeLevel: ProgramDegreeLevel.bachelor,
          facultyId: 'fac-1',
        }),
      )
    })

    it('should call onCreateSettled when success', async () => {
      const expectedData: ActionState<CreateProgramRequest, Program> = {
        data: {
          id: 'id',
          name: 'new program',
          degreeLevel: ProgramDegreeLevel.bachelor,
          facultyId: 'fac-1',
        },
      }
      vi.mocked(createProgramAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: CreateProgramRequest = {
        name: 'new program',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'fac-1',
      }
      let receivedArgs: CreateProgramRequest
      let receivedData: ActionState<CreateProgramRequest, Program>
      const { result } = renderHook(() =>
        useCreateProgram((args, data) => {
          receivedArgs = args
          receivedData = data
        }),
      )

      result.current.createProgram(expectedArgs)

      await waitFor(() => expect(receivedArgs).toStrictEqual(expectedArgs))
      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should call onCreateSettled when failed', async () => {
      const expectedData: ActionState<CreateProgramRequest, Program> = {
        error: {
          status: 500,
          ...internalError.error,
        },
      }
      vi.mocked(createProgramAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: CreateProgramRequest = {
        name: 'new program',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'fac-1',
      }
      let receivedData: ActionState<CreateProgramRequest, Program>
      const { result } = renderHook(() =>
        useCreateProgram((_args, data) => {
          receivedData = data
        }),
      )

      result.current.createProgram(expectedArgs)

      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })
  })

  describe('useDeleteProgram', () => {
    it('should call deleteProgramAction once', async () => {
      const { result } = renderHook(() => useDeleteProgram())

      result.current.deleteProgram({
        id: 'id',
        name: 'name',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'fac-1',
      })

      await waitFor(() =>
        expect(deleteProgramAction).toHaveBeenCalledExactlyOnceWith('id'),
      )
    })

    it('should call onDeleteSettled when success', async () => {
      const expectedData: ActionState<string, boolean> = {
        data: true,
      }
      vi.mocked(deleteProgramAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: Program = {
        id: 'id',
        name: 'name',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'fac-1',
      }
      let receivedArgs: Program
      let receivedData: ActionState<string, boolean>
      const { result } = renderHook(() =>
        useDeleteProgram((args, data) => {
          receivedArgs = args
          receivedData = data
        }),
      )

      result.current.deleteProgram(expectedArgs)

      await waitFor(() => expect(receivedArgs).toStrictEqual(expectedArgs))
      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })

    it('should call onDeleteSettled when failed', async () => {
      const expectedData: ActionState<string, boolean> = {
        error: {
          status: 500,
          ...internalError.error,
        },
      }
      vi.mocked(deleteProgramAction).mockResolvedValueOnce(expectedData)
      const expectedArgs: Program = {
        id: 'id',
        name: 'name',
        degreeLevel: ProgramDegreeLevel.bachelor,
        facultyId: 'fac-1',
      }
      let receivedData: ActionState<string, boolean>
      const { result } = renderHook(() =>
        useDeleteProgram((_args, data) => {
          receivedData = data
        }),
      )

      result.current.deleteProgram(expectedArgs)

      await waitFor(() => expect(receivedData).toStrictEqual(expectedData))
    })
  })
})
