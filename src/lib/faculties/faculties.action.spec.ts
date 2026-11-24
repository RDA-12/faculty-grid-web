import { redirect } from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'
import { createFacultyAction } from './faculties.action'
import { getFacultyResponse } from '../../../test/mock/http-response/faculty.response'
import httpClient from '../common/http-client/http-client.server'

vi.mock('../common/http-client/http-client.server', () => ({
  default: {
    post: vi.fn().mockImplementation(() => {
      return getFacultyResponse('/faculties', 'POST', 200)
    }),
  },
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn().mockImplementation(() => {}),
}))

describe('FacultiesAction', () => {
  describe('createFacultyAction', () => {
    const createRequest = new FormData()
    createRequest.append('name', 'faculty name')

    it('should return errors when validation failed', async () => {
      const createRequest = new FormData()
      createRequest.append('name', '')

      const result = await createFacultyAction({}, createRequest)

      expect(result).toMatchObject({
        errors: {
          name: 'Wajib diisi',
        },
      })

      const result2 = await createFacultyAction({}, new FormData())

      expect(result2).toMatchObject({
        errors: {
          name: 'Form tidak valid',
        },
      })
    })

    it('should redirect to logout when /faculties failed with 401', async () => {
      const response = getFacultyResponse('/faculties', 'POST', 401)
      vi.mocked(httpClient.post).mockImplementationOnce(async () => {
        return response
      })

      await createFacultyAction({}, createRequest)

      expect(redirect).toHaveBeenCalledExactlyOnceWith('/api/auth/logout')
    })

    it('should return error when /faculties failed', async () => {
      const response = getFacultyResponse('/faculties', 'POST', 500)
      vi.mocked(httpClient.post).mockImplementationOnce(async () => {
        return response
      })

      const result = await createFacultyAction({}, createRequest)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return new faculty when /faculties success', async () => {
      const result = await createFacultyAction({}, createRequest)

      expect(result).toMatchObject({
        data: getFacultyResponse('/faculties', 'POST', 200).data,
      })
    })

    it('should call correct endpoint', async () => {
      await createFacultyAction({}, createRequest)

      expect(httpClient.post).toHaveBeenCalledExactlyOnceWith('/faculties', {
        json: {
          name: createRequest.get('name'),
        },
      })
    })
  })
})
