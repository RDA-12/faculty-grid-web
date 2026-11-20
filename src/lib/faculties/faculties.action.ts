'use server'

import { redirect } from 'next/navigation'
import { getLogger } from '../common/logger'
import { ActionState, parseZodError } from '../common/types'
import { getSessionData } from '../common/user-session'
import { CreateFacultyRequest, CreateFacultySchema } from './faculties.schema'
import httpClient from '../common/http-client'

type Faculty = {
  id: string
  name: string
}

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

  logger.debug('get current session')
  const session = await getSessionData()
  logger.debug('session obtained')

  if (!session.accessToken) {
    logger.debug('no access token. redirect to login')
    redirect('/login')
  }

  logger.debug('start creating new faculty')
  const response = await httpClient.post<Faculty>('/faculties', {
    json: data,
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  })

  if (response.error) {
    logger.debug('create faculty failed')
    if (response.error.status === 401) {
      logger.debug('failed due to token expired. redirect to login')
      redirect('/login')
    }
    return {
      error: response.error,
    }
  }
  logger.debug('faculty created')
  return {
    data: response.data,
  }
}
