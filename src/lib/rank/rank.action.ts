import 'client-only'
import { getLogger } from '../common/logger'
import { ActionState, parseZodError } from '../common/types'
import { CreateRankRequest, CreateRankSchema } from './rank.schema'
import { Rank } from './rank.types'
import httpClient from '../common/http-client/http-client.browser'

export async function createRankAction(
  args: CreateRankRequest,
): Promise<ActionState<CreateRankRequest, Rank>> {
  const logger = getLogger('createRankAction')

  logger.debug('start parsing data', { args })
  const parsedResult = CreateRankSchema.safeParse({
    name: args.name,
    type: args.type,
  })
  if (!parsedResult.success) {
    logger.debug('parse failed', { issues: parsedResult.error.issues })
    return parseZodError(parsedResult.error)
  }
  logger.debug('request parsed', { data: parsedResult.data })
  const data = parsedResult.data

  logger.debug('start creating new rank')
  const response = await httpClient.post<Rank>('/ranks', {
    json: data,
  })

  if (response.error) {
    logger.debug('create rank failed', { error: response.error })
    return {
      error: { status: response.status, ...response.error },
    }
  }
  logger.debug('rank created', { data: response.data })
  return {
    data: response.data,
  }
}
