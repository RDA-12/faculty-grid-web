import { beforeEach, describe, expect, it } from 'vitest'
import { getProgramResponse } from '../../../test/mock/http-response/program.response'
import { getProgramsQuery } from './programs.query'
import type { PaginatedData } from '../common/pagination'
import type { Program } from './program.types'
import httpClient from '../../../test/mock/http-client'
import type { PaginatedHTTPResponse } from '../common/http-client/common.http-client'

describe('ProgramsQuery', () => {
  describe('getProgramsQuery', () => {
    beforeEach(() => {
      httpClient.get.mockImplementation(
        async (_endpoint, _options, _params) =>
          getProgramResponse(
            '/programs',
            'GET',
            200,
          ) as PaginatedHTTPResponse<Program>,
      )
    })

    it('should return error when /programs failed', async () => {
      const response = getProgramResponse('/programs', 'GET', 500)
      httpClient.get.mockImplementationOnce(async () => {
        return {
          status: response.status,
          error: response.error,
        }
      })

      const result = await getProgramsQuery(httpClient)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return correct programs when /programs success', async () => {
      const result = await getProgramsQuery(httpClient)

      const expected = getProgramResponse(
        '/programs',
        'GET',
        200,
      ) as PaginatedData<Program>
      expect(result).toMatchObject({
        data: {
          data: expected.data,
          pagination: expected.pagination,
        },
      })
    })

    it('should call correct endpoint', async () => {
      await getProgramsQuery(httpClient)

      expect(httpClient.get).toHaveBeenCalledExactlyOnceWith(
        '/programs',
        {},
        {},
      )
    })

    it('should call correct endpoint with params', async () => {
      await getProgramsQuery(httpClient, {
        search: 'informasi',
        facultyId: 'fac-1',
      })

      expect(httpClient.get).toHaveBeenCalledExactlyOnceWith(
        '/programs',
        {},
        { search: 'informasi', facultyId: 'fac-1' },
      )
    })
  })
})
