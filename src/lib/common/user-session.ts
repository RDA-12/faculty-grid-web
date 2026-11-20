import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getLogger } from './logger'

export type UserToken = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export type User = {
  id: string
  name: string
  email: string
}

type SessionData = {
  accessToken: string
  refreshToken: string
  userId: string
}

export async function setSession(token: UserToken, user: User): Promise<void> {
  const logger = getLogger('setSession')

  logger.debug('get session from iron-session')
  const session = await getIronSession<SessionData>(await cookies(), {
    cookieName: 'session',
    password: process.env.SESSION_PASSWORD!,
  })
  logger.debug('set session')
  session.accessToken = token.accessToken
  session.refreshToken = token.refreshToken
  session.userId = user.id
  logger.debug('save session')
  await session.save()
}

export async function getUserId(): Promise<string | null> {
  const logger = getLogger('getSession')

  logger.debug('get session from iron-session')
  const session = await getIronSession<SessionData>(await cookies(), {
    cookieName: 'session',
    password: process.env.SESSION_PASSWORD!,
  })
  logger.debug('session obtained')
  if (session.userId) {
    logger.debug('user exists')
    return session.userId
  }
  logger.debug('user not exists')
  return null
}
