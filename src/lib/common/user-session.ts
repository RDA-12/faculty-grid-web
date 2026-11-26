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
  const logger = getLogger('getMyIronSession')

  logger.debug('start getting cookies from next/headers')
  const cookie = await cookies()
  logger.debug('cookies obtained. start get my iron session')
  const session = await getIronSession<SessionData>(cookie, {
    cookieName: 'session',
    password: process.env.SESSION_PASSWORD!,
  })
  logger.debug('iron session obtained', { session })
  return session
}

export async function setSession(token: UserToken): Promise<void> {
  const logger = getLogger('setSession')

  logger.debug('get user session from iron-session')
  const session = await getMyIronSession()
  logger.debug('set session', { session })
  session.accessToken = token.accessToken
  session.refreshToken = token.refreshToken
  logger.debug('save session', { newSession: session })
  await session.save()
}

export async function getSessionData(): Promise<Partial<SessionData>> {
  const logger = getLogger('getSessionData')

  logger.debug('get user session from iron-session')
  const session = await getMyIronSession()
  logger.debug('session obtained', { session })
  return session
}

export async function clearSessionData(): Promise<void> {
  const logger = getLogger('clearSessionData')

  logger.debug('get user session from iron-session')
  const session = await getMyIronSession()

  logger.debug('session obtained. start clearing it', { session })
  session.destroy()
  const destroyed = await getMyIronSession()
  logger.debug('session cleared', { destroyed })
}
