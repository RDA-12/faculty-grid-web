import 'client-only'
import { getLogger } from '../common/logger'
import { ActionState, parseZodError } from '../common/types'
import { CreateProgramRequest, CreateProgramSchema } from './programs.schema'
import { Program } from './program.types'
import httpClient from '../common/http-client/http-client.browser'

export async function createProgramAction(
  args: CreateProgramRequest,
): Promise<ActionState<CreateProgramRequest, Program>> {
  const logger = getLogger('createProgramAction')

  logger.debug('start parsing data', { args })
  const parsedResult = CreateProgramSchema.safeParse({
    name: args.name,
    facultyId: args.facultyId,
    degreeLevel: args.degreeLevel,
  })
  if (!parsedResult.success) {
    logger.debug('parse failed', { issues: parsedResult.error.issues })
    return parseZodError(parsedResult.error)
  }
  logger.debug('request parsed', { data: parsedResult.data })
  const data = parsedResult.data

  logger.debug('start creating new program')
  const response = await httpClient.post<Program>('/programs', {
    json: data,
  })

  if (response.error) {
    logger.debug('create program failed', { error: response.error })
    return {
      error: { status: response.status, ...response.error },
    }
  }
  logger.debug('program created', { data: response.data })
  return {
    data: response.data,
  }
}

export async function deleteProgramAction(
  id: string,
): Promise<ActionState<string, boolean>> {
  const logger = getLogger('deleteProgramAction')

  logger.debug('start deleting a program', { id })
  const response = await httpClient.delete(`/programs/${id}`, {})

  if (response?.error) {
    logger.debug('delete program failed', { error: response.error })
    return {
      error: {
        status: response.status,
        ...response.error,
      },
    }
  }
  logger.debug('delete program success', { data: response.data })
  return {
    data: true,
  }
}
