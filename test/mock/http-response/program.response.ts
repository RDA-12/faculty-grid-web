import {
  HTTPEndpointResponseMock,
  HTTPMethod,
  HTTPStatus,
  internalError,
  safeGetResponse,
} from './common.response'
import type { Program } from '../../../src/lib/programs/program.types'

type ProgramEndpoint = '/programs' | '/programs/id'

const programResponse: HTTPEndpointResponseMock<ProgramEndpoint, Program> = {
  '/programs': {
    POST: {
      200: {
        status: 201,
        data: {
          id: '01a2029d-5106-7e9e-9f28-f108b95c930c',
          name: 'Sistem Informasi',
          facultyId: '01a1f881-5310-76ea-b7b7-56bc21c71aeb',
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
            name: 'Sistem Informasi',
            facultyId: '01a2029d-5106-7e9e-9f28-f108b95c930c',
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
  '/programs/id': {
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

export function getProgramResponse(
  endpoint: ProgramEndpoint,
  method: HTTPMethod,
  status: HTTPStatus,
) {
  return safeGetResponse(programResponse, endpoint, method, status)
}
