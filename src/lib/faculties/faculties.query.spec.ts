import { beforeEach, describe, expect, it } from 'vitest'
import { getFacultyResponse } from '../../../test/mock/http-response/faculty.response'
import { getFacultiesQuery } from './faculties.query'
import type { PaginatedData } from '../common/pagination'
import type { Faculty } from './faculty.types'
import httpClient from '../../../test/mock/http-client'
import type { PaginatedHTTPResponse } from '../common/http-client/common.http-client'

describe('FacultiesQuery', () => {
  describe('getFacultiesQuery', () => {
    beforeEach(() => {
      httpClient.get.mockImplementation(
        async (_endpoint, _options, _params) =>
          getFacultyResponse(
            '/faculties',
            'GET',
            200,
          ) as PaginatedHTTPResponse<Faculty>,
      )
    })

    it('should return error when /faculties failed', async () => {
      const response = getFacultyResponse('/faculties', 'GET', 500)
      httpClient.get.mockImplementationOnce(async () => {
        return {
          status: response.status,
          error: response.error,
        }
      })

      const result = await getFacultiesQuery(httpClient)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return correct faculties when /faculties success', async () => {
      const result = await getFacultiesQuery(httpClient)

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
      await getFacultiesQuery(httpClient)

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
