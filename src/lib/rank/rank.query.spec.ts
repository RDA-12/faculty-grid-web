import { beforeEach, describe, expect, it } from 'vitest'
import { getRankResponse } from '../../../test/mock/http-response/rank.response'
import { getRanksQuery } from './rank.query'
import type { PaginatedData } from '../common/pagination'
import { RankType, type Rank } from './rank.types'
import httpClient from '../../../test/mock/http-client'
import type { PaginatedHTTPResponse } from '../common/http-client/common.http-client'

describe('RankQuery', () => {
  describe('getRanksQuery', () => {
    beforeEach(() => {
      httpClient.get.mockImplementation(
        async (_endpoint, _options, _params) =>
          getRankResponse('/ranks', 'GET', 200) as PaginatedHTTPResponse<Rank>,
      )
    })

    it('should return error when /ranks failed', async () => {
      const response = getRankResponse('/ranks', 'GET', 500)
      httpClient.get.mockImplementationOnce(async () => {
        return {
          status: response.status,
          error: response.error,
        }
      })

      const result = await getRanksQuery(httpClient)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return correct ranks when /ranks success', async () => {
      const result = await getRanksQuery(httpClient)

      const expected = getRankResponse(
        '/ranks',
        'GET',
        200,
      ) as PaginatedData<Rank>
      expect(result).toMatchObject({
        data: {
          data: expected.data,
          pagination: expected.pagination,
        },
      })
    })

    it('should call correct endpoint', async () => {
      await getRanksQuery(httpClient)

      expect(httpClient.get).toHaveBeenCalledExactlyOnceWith('/ranks', {}, {})
    })

    it('should call correct endpoint with params', async () => {
      await getRanksQuery(httpClient, {
        search: 'penata',
        type: RankType.asn,
      })

      expect(httpClient.get).toHaveBeenCalledExactlyOnceWith(
        '/ranks',
        {},
        { search: 'penata', type: RankType.asn },
      )
    })
  })
})
