import { getLogger } from './logger'
import { Pagination, PaginationResult } from './pagination'

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

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

type HTTPOptions = {
  json?: unknown
  headers?: Record<string, any>
} & Omit<RequestInit, 'method' | 'body' | 'headers'>

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

  logger.debug('request finished. parse response body')
  const jsonResponse = await response.json()
  logger.debug('response body parsed')
  return jsonResponse
}

function get<T>(
  endpoint: string,
  options: Omit<HTTPOptions, 'json'>,
): Promise<HTTPResponse<T>>
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

  const requestInit: RequestInit = {
    ...options,
    method: 'GET',
  }
  logger.debug('start making the request')
  const response = await fetch(apiUrl + endpoint, requestInit)

  logger.debug('request finished. parse response body')
  const jsonResponse = await response.json()
  logger.debug('response body parsed')
  return jsonResponse
}

/**
 * Focus primarily to make request to backend. Prefixing all endpoint with
 * backend url set in env
 */
const httpClient = { post, get }

export default httpClient
