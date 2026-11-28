import { describe, expect, it, vi } from 'vitest'
import { createRankAction, deleteRankAction } from './rank.action'
import { getRankResponse } from '../../../test/mock/http-response/rank.response'
import httpClient from '../common/http-client/http-client.browser'
import type { CreateRankRequest } from './rank.schema'
import { RankType } from './rank.types'

vi.mock('../common/http-client/http-client.browser', () => ({
  default: {
    post: vi.fn().mockImplementation(() => {
      return getRankResponse('/ranks', 'POST', 200)
    }),
    delete: vi
      .fn()
      .mockImplementation(() => getRankResponse('/ranks/id', 'DELETE', 204)),
  },
}))

describe('RankAction', () => {
  describe('createRankAction', () => {
    const createRequest: CreateRankRequest = {
      name: 'Penata Muda (III/a)',
      type: RankType.asn,
    }

    it('should return errors when name validation failed', async () => {
      const result = await createRankAction({
        name: '',
        type: RankType.asn,
      })

      expect(result).toMatchObject({
        errors: {
          name: 'Wajib diisi',
        },
      })
    })

    it('should return errors when type validation failed', async () => {
      const result = await createRankAction({
        name: 'Penata Muda (III/a)',
        type: '' as unknown as RankType,
      })

      expect(result).toMatchObject({
        errors: {
          type: 'Wajib diisi',
        },
      })
    })

    it('should return error when /ranks failed', async () => {
      const response = getRankResponse('/ranks', 'POST', 500)
      vi.mocked(httpClient.post).mockImplementationOnce(async () => {
        return response
      })

      const result = await createRankAction(createRequest)

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return new rank when /ranks success', async () => {
      const result = await createRankAction(createRequest)

      expect(result).toMatchObject({
        data: getRankResponse('/ranks', 'POST', 200).data,
      })
    })

    it('should call correct endpoint', async () => {
      await createRankAction(createRequest)

      expect(httpClient.post).toHaveBeenCalledExactlyOnceWith('/ranks', {
        json: {
          name: createRequest.name,
          type: createRequest.type,
        },
      })
    })
  })

  describe('deleteRankAction', () => {
    it('should return error when /ranks/id failed', async () => {
      const response = getRankResponse('/ranks/id', 'DELETE', 500)
      vi.mocked(httpClient.delete).mockImplementationOnce(async () => {
        return response
      })

      const result = await deleteRankAction('id')

      expect(result).toMatchObject({
        error: response.error,
      })
    })

    it('should return success when /ranks/id success', async () => {
      const result = await deleteRankAction('id')

      expect(result).toMatchObject({
        data: true,
      })
    })

    it('should call correct endpoint', async () => {
      await deleteRankAction('rankId')

      expect(httpClient.delete).toHaveBeenCalledExactlyOnceWith(
        '/ranks/rankId',
        {},
      )
    })
  })
})
