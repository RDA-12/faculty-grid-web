import { describe, expect, it, vi } from 'vitest'
import { createFacultyAction, deleteFacultyAction } from './faculties.action'
import { getFacultyResponse } from '../../../test/mock/http-response/faculty.response'
import httpClient from '../common/http-client/http-client.browser'
import type { CreateFacultyRequest } from './faculties.schema'

vi.mock('../common/http-client/http-client.browser', () => ({
  default: {
    post: vi.fn().mockImplementation(() => {
      return getFacultyResponse('/faculties', 'POST', 200)
    }),
    delete: vi
      .fn()
      .mockImplementation(() =>
        getFacultyResponse('/faculties/id', 'DELETE', 204),
      ),
  },
}))

describe('FacultiesAction', () => {
  describe('createFacultyAction', () => {
    const createRequest: CreateFacultyRequest = {
      name: 'faculty name',
    }

    it('should return errors when validation failed', async () => {
      const result = await createFacultyAction({
        name: '',
      })

      expect(result).toMatchObject({
        errors: {
          name: 'Wajib diisi',
        },
      })
    })

    it('should return error when /faculties failed', async () => {
      const response = getFacultyResponse('/faculties', 'POST', 500)
      vi.mocked(httpClient.post).mockImplementationOnce(async () => {
        return response
      })

      const result = await createFacultyAction(createRequest)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return new faculty when /faculties success', async () => {
      const result = await createFacultyAction(createRequest)

      expect(result).toMatchObject({
        data: getFacultyResponse('/faculties', 'POST', 200).data,
      })
    })

    it('should call correct endpoint', async () => {
      await createFacultyAction(createRequest)

      expect(httpClient.post).toHaveBeenCalledExactlyOnceWith('/faculties', {
        json: {
          name: createRequest.name,
        },
      })
    })
  })

  describe('deleteFacultyAction', () => {
    it('should return error when /faculties/id failed', async () => {
      const response = getFacultyResponse('/faculties/id', 'DELETE', 500)
      vi.mocked(httpClient.delete).mockImplementationOnce(async () => {
        return response
      })

      const result = await deleteFacultyAction('id')

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return new faculty when /faculties/id success', async () => {
      const result = await deleteFacultyAction('id')

      expect(result).toMatchObject({
        data: true,
      })
    })

    it('should call correct endpoint', async () => {
      await deleteFacultyAction('facultyId')

      expect(httpClient.delete).toHaveBeenCalledExactlyOnceWith(
        '/faculties/facultyId',
        {},
      )
    })
  })
})
