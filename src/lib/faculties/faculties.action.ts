'use server'

import { redirect } from 'next/navigation'
import { getLogger } from '../common/logger'
import { ActionState, parseZodError } from '../common/types'
import { CreateFacultyRequest, CreateFacultySchema } from './faculties.schema'
import { Faculty } from './faculty.types'
import httpClient from '../common/http-client'

export async function createFacultyAction(
  _state: ActionState<CreateFacultyRequest, Faculty>,
  formData: FormData,
): Promise<ActionState<CreateFacultyRequest, Faculty>> {
  const logger = getLogger('createFacultyAction')

  logger.debug('start parsing data')
  const parsedResult = CreateFacultySchema.safeParse({
    name: formData.get('name'),
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
    if (response.status === 401) {
      logger.debug('failed due to token expired. redirect to logout')
      redirect('/api/auth/logout')
    }
    return {
      error: { status: response.status, ...response.error },
    }
  }
  logger.debug('faculty created')
  return {
    data: response.data,
  }
}
