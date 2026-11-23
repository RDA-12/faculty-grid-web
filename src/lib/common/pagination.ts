export type Pagination = {
  page: number
  pageSize: number
}

export type PaginationResult = {
  total: number
} & Pagination

export type PaginatedData<T> = {
  data: T[]
  pagination: PaginationResult
}
