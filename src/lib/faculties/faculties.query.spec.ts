import { describe, expect, it, vi } from 'vitest'
import { getFacultyResponse } from '../../../test/mock/http-response/faculty.response'
import httpClient from '../common/http-client'
import { getFacultiesQuery } from './faculties.query'
import type { PaginatedData } from '../common/pagination'
import type { Faculty } from './faculty.types'

vi.mock('../common/http-client', () => ({
  default: {
    get: vi.fn().mockImplementation(() => {
      return getFacultyResponse('/faculties', 'GET', 200)
    }),
  },
}))

describe('FacultiesQuery', () => {
  describe('getFacultiesQuery', () => {
    it('should return error when /faculties failed', async () => {
      const response = getFacultyResponse('/faculties', 'GET', 500)
      vi.mocked(httpClient.get).mockImplementationOnce(async () => {
        return {
          status: response.status,
          error: response.error,
        }
      })

      const result = await getFacultiesQuery()

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return correct faculties when /faculties success', async () => {
      const result = await getFacultiesQuery()

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
      await getFacultiesQuery()

      expect(httpClient.get).toHaveBeenCalledExactlyOnceWith(
        '/faculties',
        {},
        {
          page: 1,
          pageSize: 10,
        },
      )
    })
  })
})
