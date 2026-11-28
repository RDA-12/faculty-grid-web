import {
  HTTPEndpointResponseMock,
  HTTPMethod,
  HTTPStatus,
  internalError,
  safeGetResponse,
} from './common.response'
import { RankType, type Rank } from '../../../src/lib/rank/rank.types'

type RankEndpoint = '/ranks' | '/ranks/id'

const rankResponse: HTTPEndpointResponseMock<RankEndpoint, Rank> = {
  '/ranks': {
    POST: {
      200: {
        status: 201,
        data: {
          id: '01a2029d-5106-7e9e-9f28-f108b95c930c',
          name: 'Penata Muda (III/a)',
          type: RankType.asn,
        },
      },
      401: {
        status: 401,
        error: {
          title: 'Provided credential is invalid',
          detail: 'Email/password/both is invalid. Please check again',
        },
      },
      500: internalError,
    },
    GET: {
      200: {
        status: 200,
        data: [
          {
            id: '01a1f881-5310-76ea-b7b7-56bc21c71aeb',
            name: 'Penata Muda (III/a)',
            type: RankType.asn,
          },
        ],
        pagination: {
          page: 1,
          pageSize: 5,
          total: 5,
        },
      },
      401: {
        status: 401,
        error: {
          title: 'Provided credential is invalid',
          detail: 'Email/password/both is invalid. Please check again',
        },
      },
      500: internalError,
    },
  },
  '/ranks/id': {
    DELETE: {
      204: {
        status: 204,
        data: undefined,
      },
      401: {
        status: 401,
        error: {
          title: 'Provided credential is invalid',
          detail: 'Email/password/both is invalid. Please check again',
        },
      },
      500: internalError,
    },
  },
}

export function getRankResponse(
  endpoint: RankEndpoint,
  method: HTTPMethod,
  status: HTTPStatus,
) {
  return safeGetResponse(rankResponse, endpoint, method, status)
}
