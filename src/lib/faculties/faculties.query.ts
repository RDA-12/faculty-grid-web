import type { HTTPClient } from '../common/http-client/common.http-client'
import { getLogger } from '../common/logger'
import type { PaginatedData } from '../common/pagination'
import type { ActionState } from '../common/types'
import type { FacultiesQueryParams } from './faculties.schema'
import type { Faculty } from './faculty.types'

export type GetFacultiesQueryResult = ActionState<null, PaginatedData<Faculty>>

export async function getFacultiesQuery(
  httpClient: HTTPClient,
  params?: FacultiesQueryParams,
): Promise<GetFacultiesQueryResult> {
  const logger = getLogger('getFacultiesQuery')

  logger.debug('start get faculties', { params })
  const response = await httpClient.get<Faculty>('/faculties', {}, params ?? {})
  if (response.error) {
    logger.debug('get faculties failed', { error: response.error })
    return {
      error: {
        status: response.status,
        ...response.error,
      },
    }
  }
  logger.debug('get faculties success', { data: response.data })
  return {
    data: { data: response.data ?? [], pagination: response.pagination! },
  }
}
