import {
  HTTPEndpointResponseMock,
  HTTPStatus,
  safeGetResponse,
  type HTTPMethod,
} from './common.response'

type LoginData = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

type AuthEndpoint = '/auth/login'

const authResponse: HTTPEndpointResponseMock<AuthEndpoint, LoginData> = {
  '/auth/login': {
    POST: {
      200: {
        status: 200,
        data: {
          accessToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwOi8vbG9jYWxob3N0OjgwMDAiLCJhdWQiOiJ3ZWIiLCJqdGkiOiI0MGlJNUZ4QW1NN3Z4N3FBYVBNWktRIiwic3ViIjoiMDFhMWYyMTUtOWRiOS03YWU5LWE5MDMtYzY3OTExODU0YjdhIiwiaWF0IjoxNzk1MjY0OTg4LCJleHAiOjE3OTUyNjU4ODh9.vD5QscmN44PHK60-kk9hs2kkhtfPWP0HL0Qm38HjV8Q',
          refreshToken: 'Ni0hWG_O3mt8PZ5fXAXQOz1TnSx-463FmFeVej20688',
          expiresIn: 900,
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

export function getAuthResponse(
  endpoint: AuthEndpoint,
  method: HTTPMethod,
  status: HTTPStatus,
) {
  return safeGetResponse(authResponse, endpoint, method, status)
}
