import { getLogger } from '../logger'
import type { Pagination, PaginationResult } from '../pagination'

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
  json?: unknown
  headers?: Record<string, any>
} & Omit<RequestInit, 'method' | 'body' | 'headers'>

export function createHttpClient(
  baseUrl: string,
  interceptor?: () => Promise<HTTPOptions>,
) {
  /**
   * Make post request to endpoint with options.
   *
   * It will automatically add Authorization header
   */
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
    const interceptorRequestInit = interceptor ? await interceptor() : {}
    const requestInit: RequestInit = {
      ...rest,
      ...interceptorRequestInit,
      method: 'POST',
      headers: {
        ...effectiveHeaders,
        ...interceptorRequestInit.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(json),
    }

    logger.debug('start making request')
    const response = await fetch(baseUrl + endpoint, requestInit)

    logger.debug('request finished. parse response body')
    const jsonResponse = await response.json()
    logger.debug('response body parsed')
    return jsonResponse
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
    options: Omit<HTTPOptions, 'json'> = {},
    params?: Pagination,
  ): Promise<HTTPResponse<T>> {
    const logger = getLogger('httpClient.get')
    if (params) {
      logger.debug('apply query params')
      endpoint = `${endpoint}?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}`
    }

    const interceptorRequestInit = interceptor ? await interceptor() : {}
    const requestInit: RequestInit = {
      ...options,
      ...interceptorRequestInit,
      method: 'GET',
    }
    logger.debug('start making the request')
    const response = await fetch(baseUrl + endpoint, requestInit)

    logger.debug('request finished. parse response body')
    const jsonResponse = await response.json()
    logger.debug('response body parsed')
    return jsonResponse
  }

  return { post, get }
}
