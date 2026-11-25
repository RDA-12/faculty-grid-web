import 'client-only'
import { getLogger } from '../common/logger'
import { ActionState, parseZodError } from '../common/types'
import { CreateFacultyRequest, CreateFacultySchema } from './faculties.schema'
import { Faculty } from './faculty.types'
import httpClient from '../common/http-client/http-client.browser'

export async function createFacultyAction(
  args: CreateFacultyRequest,
): Promise<ActionState<CreateFacultyRequest, Faculty>> {
  const logger = getLogger('createFacultyAction')

  logger.debug('start parsing data')
  const parsedResult = CreateFacultySchema.safeParse({
    name: args.name,
  })
  if (!parsedResult.success) {
    logger.debug('parse failed')
    return parseZodError(parsedResult.error)
  }
  logger.debug('request parsed')
  const data = parsedResult.data

  logger.debug('start creating new faculty')
  const response = await httpClient.post<Faculty>('/faculties', {
    json: data,
  })

  if (response.error) {
    logger.debug('create faculty failed')
    return {
      error: { status: response.status, ...response.error },
    }
  }
  logger.debug('faculty created')
  return {
    data: response.data,
  }
}

export async function deleteFacultyAction(
  id: string,
): Promise<ActionState<string, boolean>> {
  const logger = getLogger('deleteFacultyAction')

  logger.debug('start deleting a faculty')
  const response = await httpClient.delete(`/faculties/${id}`, {})

  if (response?.error) {
    logger.debug('delete faculty failed')
    return {
      error: {
        status: response.status,
        ...response.error,
      },
    }
  }
  logger.debug('delete faculty success')
  return {
    data: true,
  }
}
