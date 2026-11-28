import type { HTTPClient } from '../common/http-client/common.http-client'
import { getLogger } from '../common/logger'
import type { PaginatedData } from '../common/pagination'
import type { ActionState } from '../common/types'
import type { RanksQueryParams } from './rank.schema'
import type { Rank } from './rank.types'

export type GetRanksQueryResult = ActionState<null, PaginatedData<Rank>>

export async function getRanksQuery(
  httpClient: HTTPClient,
  params?: RanksQueryParams,
): Promise<GetRanksQueryResult> {
  const logger = getLogger('getRanksQuery')

  logger.debug('start get ranks')
  const response = await httpClient.get<Rank>('/ranks', {}, params ?? {})
  if (response.error) {
    logger.debug('get ranks failed', { error: response.error })
    return {
      error: {
        status: response.status,
        ...response.error,
      },
    }
  }
  logger.debug('get ranks success', { data: response.data })
  return {
    data: { data: response.data ?? [], pagination: response.pagination! },
  }
}
