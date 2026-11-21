import { HTTPResponse } from '@/lib/common/http-client'

export type HTTPStatus = 200 | 201 | 401 | 403 | 422 | 500

type HTTPResponseMock<TData> = Partial<Record<HTTPStatus, HTTPResponse<TData>>>

export type HTTPEndpointResponseMock<TEndpoint extends string, TData> = Record<
  TEndpoint,
  HTTPResponseMock<TData>
>
