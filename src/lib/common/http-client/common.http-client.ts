import { getLogger } from '../logger'
import { type Axios, type AxiosRequestConfig } from 'axios'
import type { Pagination, PaginationResult } from '../pagination'

export type RetryAxiosConfig = {
  /** To mark whether this request config is already retried or not
   *
   * Its to prevent infinite refresh when the server keeps return 401 to original request
   */
  _retry?: boolean
} & AxiosRequestConfig

type BaseServerHTTPResponse = {
  status: number
}

type ServerErrorHTTPResponse = {
  title: string
  detail: string
  errors: unknown[]
} & BaseServerHTTPResponse

type ServerSuccessHTTPResponse<T> = {
  data?: T
} & BaseServerHTTPResponse

type ServerSuccessPaginatedHTTPResponse<T> = {
  data?: T[]
  pagination?: PaginationResult
} & BaseServerHTTPResponse

type ServerHTTPResponse<T> =
  | ServerSuccessHTTPResponse<T>
  | ServerSuccessPaginatedHTTPResponse<T>
  | ServerErrorHTTPResponse

type HTTPError = {
  title: string
  detail: string
  errors?: unknown
}

export type HTTPResponse<T> = {
  status: number
  error?: HTTPError
  data?: T
}

export type PaginatedHTTPResponse<T> = {
  status: number
  error?: HTTPError
  data?: T[]
  pagination?: PaginationResult
}

export type HTTPOptions = {
  headers?: Record<string, any>
  json?: Record<string, string>
}

export function createHttpClient(axios: Axios) {
  /**
   * Make post request to endpoint with options.
   *
   * It will automatically add Authorization header.
   *
   * NOTE: It assumes the T is single object not a list
   */
  async function post<T>(
    endpoint: string,
    options: HTTPOptions = {},
  ): Promise<HTTPResponse<T>> {
    const logger = getLogger('httpClient.post')

    logger.debug('start making request')
    const response = await axios.post<ServerHTTPResponse<T>>(
      endpoint,
      options.json,
      {
        headers: options.headers,
        validateStatus: () => true,
      },
    )
    const jsonResponse = response.data
    if (response.status >= 200 && response.status < 300) {
      logger.debug('request success. return data')
      return {
        status: response.status,
        data: (jsonResponse as ServerSuccessHTTPResponse<T>).data,
      }
    }
    logger.debug('request failed. return error')
    return {
      status: response.status,
      error: jsonResponse as ServerErrorHTTPResponse,
    }
  }

  /**
   * Make get request to endpoint with options.
   *
   * It will automatically add Authorization header
   */
  function get<T>(
    endpoint: string,
    options: Omit<HTTPOptions, 'json'>,
  ): Promise<HTTPResponse<T>>

  /**
   * Make get request to endpoint with options.
   *
   * It will automatically add Authorization header
   */
  function get<T>(
    endpoint: string,
    options: Omit<HTTPOptions, 'json'>,
    params: Pagination,
  ): Promise<PaginatedHTTPResponse<T>>

  async function get<T>(
    endpoint: string,
    options: Omit<HTTPOptions, 'json'>,
    params?: Pagination,
  ): Promise<HTTPResponse<T> | PaginatedHTTPResponse<T>> {
    const logger = getLogger('httpClient.get')
    if (params) {
      logger.debug('apply query params')
      endpoint = `${endpoint}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
    }

    logger.debug('start making request')
    const response = await axios.get<ServerHTTPResponse<T>>(endpoint, {
      headers: options.headers,
      validateStatus: () => true,
    })
    const jsonResponse = response.data
    if (response.status >= 200 && response.status < 300) {
      logger.debug('request success. return data')
      if (params) {
        return jsonResponse as ServerSuccessPaginatedHTTPResponse<T>
      }
      return jsonResponse as ServerSuccessHTTPResponse<T>
    }
    logger.debug('request failed. return error')
    return {
      status: response.status,
      error: jsonResponse as ServerErrorHTTPResponse,
    }
  }

  async function deleteMethod<T>(
    endpoint: string,
    options: HTTPOptions,
  ): Promise<HTTPResponse<T>> {
    const logger = getLogger('httpClient.delete')

    logger.debug('start making request')
    const response = await axios.delete<ServerHTTPResponse<null>>(endpoint, {
      headers: options.headers,
      validateStatus: () => true,
    })
    const jsonResponse = response.data
    if (response.status >= 200 && response.status < 300) {
      logger.debug('request success. return data')
      return {
        status: 204,
      }
    }
    logger.debug('request failed. return error')
    return {
      status: response.status,
      error: jsonResponse as ServerErrorHTTPResponse,
    }
  }

  return { post, get, delete: deleteMethod }
}

export type HTTPClient = ReturnType<typeof createHttpClient>
