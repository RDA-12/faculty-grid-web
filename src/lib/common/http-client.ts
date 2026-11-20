import { getLogger } from './logger'
import { getSessionData, setSession, User, UserToken } from './user-session'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

type HTTPError = {
  status: number
  title: string
  detail: string
  errors?: unknown
}

type HTTPResponse<T> = {
  error?: HTTPError
  data?: T
}

type HTTPOptions = {
  json?: unknown
  headers?: Record<string, any>
} & Omit<RequestInit, 'method' | 'body' | 'headers'>

const loginEndpoint = '/auth/login'
const refreshEndpoint = '/auth/refresh'

/**
 * Return true when token is refreshed. Otherwise, false
 */
async function refreshToken(): Promise<UserToken | null> {
  const logger = getLogger('refreshToken')

  logger.debug('start get session data')
  const session = await getSessionData()

  if (!session.refreshToken) {
    logger.debug('refreshToken not exists')
    return null
  }

  logger.debug('refreshToken exists. start refreshing token')
  const response = await post<UserToken>(refreshEndpoint, {
    json: {
      refreshToken: session.refreshToken,
    },
  })
  if (response.error) {
    logger.debug('refreshing token failed')
    return null
  }
  logger.debug('refresh token success')
  const data = response.data!

  logger.debug('start get user')
  const userResponse = await get<User>('/users/me', {
    headers: {
      Authorization: `bearer ${data.accessToken}`,
    },
  })
  if (userResponse.error) {
    logger.debug('get user failed')
    return null
  }
  logger.debug('user obtained')
  const user = userResponse.data!

  logger.debug('start save new session')
  await setSession(data, user)
  logger.debug('session saved')

  return data
}

async function retryRequest<T>(
  endpoint: string,
  accessToken: string,
  options: HTTPOptions,
): Promise<HTTPResponse<T>> {
  const logger = getLogger('retryRequest')

  const effectiveOptions: HTTPOptions = {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `bearer ${accessToken}`,
    },
  }

  logger.debug('start retrying request with new access token')
  const response = await fetch(apiUrl + endpoint, effectiveOptions)
  const json = await response.json()

  if (!response.ok) {
    logger.debug(`request failed. server respond with ${response.status}`)
    return {
      error: json,
    }
  }

  logger.debug(`request success`)
  return {
    data: json,
  }
}

async function post<T>(
  endpoint: string,
  options: HTTPOptions = {},
): Promise<HTTPResponse<T>> {
  const logger = getLogger('httpClient.post')

  const { json, headers, ...rest } = options
  const effectiveHeaders =
    headers instanceof Array
      ? Object.fromEntries(headers)
      : (headers as Record<string, string>)
  const requestInit: RequestInit = {
    ...rest,
    method: 'POST',
    headers: {
      ...effectiveHeaders,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(json),
  }

  logger.debug('start making request')
  const response = await fetch(apiUrl + endpoint, requestInit)

  logger.debug('request finished. parse to json')
  const jsonResponse = await response.json()
  if (!response.ok) {
    const errorToReturn = {
      error: jsonResponse,
    }
    logger.debug('respond failed')
    if (endpoint !== loginEndpoint && response.status === 401) {
      logger.debug(
        'returned status is 401, might be expired token. start refresh token',
      )
      const result = await refreshToken()
      if (!result) {
        logger.debug('refresh token failed. return original error')
        return errorToReturn
      }
      logger.debug('refresh token success. retrying request')
      return retryRequest(endpoint, result.accessToken, requestInit)
    }
    return errorToReturn
  }

  logger.debug('respond success')
  return {
    data: jsonResponse.data as T,
  }
}

async function get<T>(
  endpoint: string,
  options: Omit<HTTPOptions, 'json'> = {},
): Promise<HTTPResponse<T>> {
  const logger = getLogger('httpClient.get')

  const requestInit: RequestInit = {
    ...options,
    method: 'GET',
  }
  logger.debug('start making the request')
  const response = await fetch(apiUrl + endpoint, requestInit)

  logger.debug('request finished. parse json respond')
  const jsonResponse = await response.json()
  if (!response.ok) {
    const errorToReturn = {
      error: jsonResponse,
    }
    logger.debug('respond failed')
    if (response.status === 401) {
      logger.debug(
        'returned status is 401, might be expired token. start refresh token',
      )
      const result = await refreshToken()
      if (!result) {
        logger.debug('refresh token failed. return original error')
        return errorToReturn
      }
      logger.debug('refresh token success. retrying request')
      return retryRequest(endpoint, result.accessToken, requestInit)
    }
    return errorToReturn
  }

  logger.debug('respond success')
  return {
    data: jsonResponse.data,
  }
}

const httpClient = {
  post: post,
  get: get,
}

export default httpClient
