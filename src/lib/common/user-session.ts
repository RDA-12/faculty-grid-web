import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { getLogger } from './logger'

export type UserToken = {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

type SessionData = {
  accessToken: string
  refreshToken: string
}

async function getMyIronSession() {
  const session = await getIronSession<SessionData>(await cookies(), {
    cookieName: 'session',
    password: process.env.SESSION_PASSWORD!,
  })

  return session
}

export async function setSession(token: UserToken): Promise<void> {
  const logger = getLogger('setSession')

  logger.debug('get user session from iron-session')
  const session = await getMyIronSession()
  logger.debug('set session')
  session.accessToken = token.accessToken
  session.refreshToken = token.refreshToken
  logger.debug('save session')
  await session.save()
}

export async function getSessionData(): Promise<Partial<SessionData>> {
  const logger = getLogger('getSessionData')

  logger.debug('get user session from iron-session')
  const session = await getMyIronSession()
  logger.debug('session obtained')
  return session
}

export async function clearSessionData(): Promise<void> {
  const logger = getLogger('clearSessionData')

  logger.debug('get user session from iron-session')
  const session = await getMyIronSession()

  logger.debug('session obtained. start clearing it')
  session.destroy()
}
