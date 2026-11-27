import { describe, expect, it, vi } from 'vitest'
import { createProgramAction, deleteProgramAction } from './programs.action'
import { getProgramResponse } from '../../../test/mock/http-response/program.response'
import httpClient from '../common/http-client/http-client.browser'
import type { CreateProgramRequest } from './programs.schema'
import { ProgramDegreeLevel } from './program.types'

vi.mock('../common/http-client/http-client.browser', () => ({
  default: {
    post: vi.fn().mockImplementation(() => {
      return getProgramResponse('/programs', 'POST', 200)
    }),
    delete: vi
      .fn()
      .mockImplementation(() =>
        getProgramResponse('/programs/id', 'DELETE', 204),
      ),
  },
}))

describe('ProgramsAction', () => {
  describe('createProgramAction', () => {
    const createRequest: CreateProgramRequest = {
      name: 'program name',
      facultyId: 'faculty-id-123',
      degreeLevel: ProgramDegreeLevel.bachelor,
    }

    it('should return errors when name validation failed', async () => {
      const result = await createProgramAction({
        name: '',
        facultyId: 'faculty-id-123',
        degreeLevel: ProgramDegreeLevel.bachelor,
      })

      expect(result).toMatchObject({
        errors: {
          name: 'Wajib diisi',
        },
      })
    })

    it('should return errors when facultyId validation failed', async () => {
      const result = await createProgramAction({
        name: 'program name',
        facultyId: '',
        degreeLevel: ProgramDegreeLevel.bachelor,
      })

      expect(result).toMatchObject({
        errors: {
          facultyId: 'Wajib diisi',
        },
      })
    })

    it('should return errors when degreeLevel validation failed', async () => {
      const result = await createProgramAction({
        name: 'program name',
        facultyId: 'faculty-id-123',
        degreeLevel: '' as unknown as ProgramDegreeLevel,
      })

      expect(result).toMatchObject({
        errors: {
          degreeLevel: 'Wajib diisi',
        },
      })
    })

    it('should return error when /programs failed', async () => {
      const response = getProgramResponse('/programs', 'POST', 500)
      vi.mocked(httpClient.post).mockImplementationOnce(async () => {
        return response
      })

      const result = await createProgramAction(createRequest)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return new program when /programs success', async () => {
      const result = await createProgramAction(createRequest)

      expect(result).toMatchObject({
        data: getProgramResponse('/programs', 'POST', 200).data,
      })
    })

    it('should call correct endpoint', async () => {
      await createProgramAction(createRequest)

      expect(httpClient.post).toHaveBeenCalledExactlyOnceWith('/programs', {
        json: {
          name: createRequest.name,
          facultyId: createRequest.facultyId,
          degreeLevel: createRequest.degreeLevel,
        },
      })
    })
  })

  describe('deleteProgramAction', () => {
    it('should return error when /programs/id failed', async () => {
      const response = getProgramResponse('/programs/id', 'DELETE', 500)
      vi.mocked(httpClient.delete).mockImplementationOnce(async () => {
        return response
      })

      const result = await deleteProgramAction('id')

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return success when /programs/id success', async () => {
      const result = await deleteProgramAction('id')

      expect(result).toMatchObject({
        data: true,
      })
    })

    it('should call correct endpoint', async () => {
      await deleteProgramAction('programId')

      expect(httpClient.delete).toHaveBeenCalledExactlyOnceWith(
        '/programs/programId',
        {},
      )
    })
  })
})
