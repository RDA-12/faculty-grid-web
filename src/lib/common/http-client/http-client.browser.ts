import { getLogger } from '../logger'
import { Pagination } from '../pagination'
import type {
  HTTPOptions,
  HTTPResponse,
  PaginatedHTTPResponse,
} from './common.http-client'

const proxyPrefix = process.env.NEXT_PUBLIC_SITE_URL + '/api/proxy'

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
  const response = await fetch(proxyPrefix + endpoint, requestInit)

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
  const response = await fetch(proxyPrefix + endpoint, requestInit)

  logger.debug('request finished. parse response body')
  const jsonResponse = await response.json()
  logger.debug('response body parsed')
  return jsonResponse
}

/**
 * Focus primarily to make request to internal nextjs proxy route handlers
 */
const httpClient = { post, get }

export default httpClient
