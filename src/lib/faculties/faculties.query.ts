import httpClient from '../common/http-client'
import { getLogger } from '../common/logger'
import type { PaginatedData } from '../common/pagination'
import type { ActionState } from '../common/types'
import type { Faculty } from './faculty.types'

export type getFacultiesQueryResult = ActionState<null, PaginatedData<Faculty>>

export async function getFacultiesQuery(): Promise<getFacultiesQueryResult> {
  const logger = getLogger('getFacultiesQuery')

  logger.debug('start get faculties')
  const response = await httpClient.get<Faculty>(
    '/faculties',
    {},
    {
      page: 1,
      pageSize: 10,
    },
  )
  if (response.error) {
    logger.debug('get faculties failed')
    return {
      error: {
        status: response.status,
        ...response.error,
      },
    }
  }
  logger.debug('get faculties success')
  return {
    data: { data: response.data ?? [], pagination: response.pagination! },
  }
}
