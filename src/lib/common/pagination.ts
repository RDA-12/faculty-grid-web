import z from 'zod'

export type Pagination = {
  page?: number
  pageSize?: number
}

export type PaginationResult = {
  total: number
} & Pagination

export type PaginatedData<T> = {
  data: T[]
  pagination: PaginationResult
}

export const PaginationQuerySchema = z.object({
  page: z.number().default(1),
  pageSize: z.number().default(10),
})
