import {
  HTTPEndpointResponseMock,
  HTTPMethod,
  HTTPStatus,
  safeGetResponse,
} from './common.response'

type Faculty = {
  id: string
  name: string
}

type FacultyEndpoint = '/faculties'

const facultyResponse: HTTPEndpointResponseMock<FacultyEndpoint, Faculty> = {
  '/faculties': {
    POST: {
      200: {
        status: 201,
        data: {
          id: '01a2029d-5106-7e9e-9f28-f108b95c930c',
          name: 'Fakultas Ekonomi',
        },
      },
      401: {
        status: 401,
        error: {
          title: 'Provided credential is invalid',
          detail: 'Email/password/both is invalid. Please check again',
        },
      },
    },
  },
}

export function getFacultyResponse(
  endpoint: FacultyEndpoint,
  method: HTTPMethod,
  status: HTTPStatus,
) {
  return safeGetResponse(facultyResponse, endpoint, method, status)
}
