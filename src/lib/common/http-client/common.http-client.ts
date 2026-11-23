import type { PaginationResult } from '../pagination'

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
