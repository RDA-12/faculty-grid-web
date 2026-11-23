import { HTTPResponse, PaginatedHTTPResponse } from '@/lib/common/http-client'

export type HTTPStatus = 200 | 201 | 401 | 403 | 422 | 500

export type HTTPMethod = 'GET' | 'POST' | 'PUT'

type HTTPResponseMock<TData> = Partial<
  Record<HTTPStatus, HTTPResponse<TData> | PaginatedHTTPResponse<TData>>
>

type HTTPMethodResponseMock<TData> = Partial<
  Record<HTTPMethod, HTTPResponseMock<TData>>
>

export type HTTPEndpointResponseMock<TEndpoint extends string, TData> = Record<
  TEndpoint,
  HTTPMethodResponseMock<TData>
>

export function safeGetResponse<TEndpoint extends string, TData>(
  response: HTTPEndpointResponseMock<TEndpoint, TData>,
  endpoint: TEndpoint,
  method: HTTPMethod,
  status: HTTPStatus,
) {
  if (!response[endpoint]) {
    throw `${endpoint} not yet mocked`
  }
  if (!response[endpoint]![method]) {
    throw `Method ${method} for ${endpoint} not yet mocked`
  }
  if (!response[endpoint]![method]![status]) {
    throw `Status ${status} for method ${method}for ${endpoint} not yet mocked`
  }
  return response[endpoint][method][status]
}

export const internalError = {
  status: 500,
  error: {
    title: 'Internal error',
    detail: 'Internal error detail',
  },
}
