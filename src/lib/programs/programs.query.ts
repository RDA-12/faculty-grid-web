import type { HTTPClient } from '../common/http-client/common.http-client'
import { getLogger } from '../common/logger'
import type { PaginatedData } from '../common/pagination'
import type { ActionState } from '../common/types'
import type { ProgramsQueryParams } from './programs.schema'
import type { Program } from './program.types'

export type GetProgramsQueryResult = ActionState<null, PaginatedData<Program>>

export async function getProgramsQuery(
  httpClient: HTTPClient,
  params?: ProgramsQueryParams,
): Promise<GetProgramsQueryResult> {
  const logger = getLogger('getProgramsQuery')

  logger.debug('start get programs', { params })
  const response = await httpClient.get<Program>('/programs', {}, params ?? {})
  if (response.error) {
    logger.debug('get programs failed', { error: response.error })
    return {
      error: {
        status: response.status,
        ...response.error,
      },
    }
  }
  logger.debug('get programs success', { data: response.data })
  return {
    data: { data: response.data ?? [], pagination: response.pagination! },
  }
}
