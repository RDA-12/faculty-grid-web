import { HTTPEndpointResponseMock, HTTPStatus } from './common.response'

type UserData = {
  id: string
  name: string
  email: string
}

type UserEndpoint = '/users/me'

const userResponse: HTTPEndpointResponseMock<UserEndpoint, UserData> = {
  '/users/me': {
    200: {
      status: 200,
      data: {
        id: '01a1f215-9db9-7ae9-a903-c67911854b7a',
        name: 'Admin Uni',
        email: 'admin@uni.com',
      },
    },
    500: {
      status: 500,
      error: {
        title: 'Internal error',
        detail: 'Internal error',
      },
    },
  },
}

export function getUserResponse(endpoint: UserEndpoint, status: HTTPStatus) {
  return userResponse[endpoint][status]
}
