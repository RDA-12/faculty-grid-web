'use server'

import { redirect } from 'next/navigation'
import { ActionState, parseZodError } from '../common/types'
import { LoginRequest, LoginSchema } from './auth.schema'
import { getLogger } from '../common/logger'
import httpClient from '../common/http-client'
import { setSession, User, UserToken } from '../common/user-session'

export async function loginAction(
  _state: ActionState<LoginRequest, null>,
  formData: FormData,
): Promise<ActionState<LoginRequest, null>> {
  const logger = getLogger('login-action')

  logger.debug('parse form data')
  const parseResult = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })
  if (!parseResult.success) {
    logger.debug('there are invalid value on form data')
    return parseZodError(parseResult.error)
  }
  logger.debug('form data parsed')
  const data = parseResult.data

  logger.debug('start logging in user')
  const result = await httpClient.post<UserToken>('/auth/login', { json: data })

  if (result.error) {
    logger.debug('failed to log in')
    return {
      error: { status: result.status, ...result.error },
    }
  }
  logger.debug('login succes')
  const userToken = result.data!

  logger.debug('start getting user data')
  const userResult = await httpClient.get<User>('/users/me', {
    headers: { Authorization: `Bearer ${userToken.accessToken}` },
  })
  if (userResult.error) {
    logger.debug('failed to get user data')
    return {
      error: { status: result.status, ...userResult.error },
    }
  }
  logger.debug('user data obtained')
  const user = userResult.data!

  logger.debug('start saving session')
  await setSession(userToken, user)
  logger.debug('session saved, redirect user to home')
  redirect('/')
}
