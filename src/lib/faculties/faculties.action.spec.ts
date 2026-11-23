import { redirect } from 'next/navigation'
import { getSessionData } from '../common/user-session'
import { describe, expect, it, vi } from 'vitest'
import { createFacultyAction, getFacultiesAction } from './faculties.action'
import { getFacultyResponse } from '../../../test/mock/http-response/faculty.response'
import type { PaginatedData } from '../common/pagination'
import type { Faculty } from './faculty.types'
import httpClient from '../common/http-client'

vi.mock('../common/user-session', () => ({
  getSessionData: vi.fn().mockImplementation(() => ({
    accessToken: 'Access Token',
  })),
}))
vi.mock('../common/http-client', () => ({
  default: {
    post: vi.fn().mockImplementation(() => {
      return getFacultyResponse('/faculties', 'POST', 200)
    }),
    get: vi.fn().mockImplementation(() => {
      return getFacultyResponse('/faculties', 'GET', 200)
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

    it('should redirect to login when session is empty', async () => {
      vi.mocked(getSessionData).mockImplementationOnce(async () => ({}))

      await createFacultyAction({}, createRequest)

      expect(redirect).toHaveBeenCalledExactlyOnceWith('/login')
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
        headers: {
          Authorization: 'Bearer Access Token',
        },
      })
    })
  })

  describe('getFacultiesAction', () => {
    it('should redirect to login when session is empty', async () => {
      vi.mocked(getSessionData).mockImplementationOnce(async () => ({}))

      await getFacultiesAction({})

      expect(redirect).toHaveBeenCalledExactlyOnceWith('/login')
    })

    it('should redirect to logout when /faculties failed with 401', async () => {
      const response = getFacultyResponse('/faculties', 'GET', 401)
      vi.mocked(httpClient.get).mockImplementationOnce(async () => {
        return {
          status: response.status,
          error: response.error,
        }
      })

      await getFacultiesAction({})

      expect(redirect).toHaveBeenCalledExactlyOnceWith('/api/auth/logout')
    })

    it('should return error when /faculties failed', async () => {
      const response = getFacultyResponse('/faculties', 'GET', 500)
      vi.mocked(httpClient.get).mockImplementationOnce(async () => {
        return {
          status: response.status,
          error: response.error,
        }
      })

      const result = await getFacultiesAction({})

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return correct faculties when /faculties success', async () => {
      const result = await getFacultiesAction({})

      const expected = getFacultyResponse(
        '/faculties',
        'GET',
        200,
      ) as PaginatedData<Faculty>
      expect(result).toMatchObject({
        data: {
          data: expected.data,
          pagination: expected.pagination,
        },
      })
    })

    it('should call correct endpoint and params', async () => {
      await getFacultiesAction({})

      expect(httpClient.get).toHaveBeenCalledExactlyOnceWith(
        '/faculties',
        {
          headers: {
            Authorization: 'bearer Access Token',
          },
        },
        {
          page: 1,
          pageSize: 10,
        },
      )
    })
  })
})
