import { getLogger } from '@/lib/common/logger'
import {
  clearSessionData,
  getSessionData,
  setSession,
} from '@/lib/common/user-session'
import axios from 'axios'
import { NextResponse } from 'next/server'

type UserToken = {
  refreshToken: string
  accessToken: string
  expiresIn: number
}

type Response = {
  data: UserToken
}

export async function POST(_req: Request) {
  const logger = getLogger('RefreshRouteHandler')

  logger.debug('start get current user session')
  const session = await getSessionData()
  logger.debug('user session obtained', { session })

  if (!session.refreshToken) {
    logger.debug('refresh token not found. clear session')
    await clearSessionData()
    logger.debug('session cleared. return 401')
    return NextResponse.json(
      {
        status: 401,
        title: 'Missing refresh token',
        detail: 'Refresh token not found',
      },
      { status: 401 },
    )
  }

  logger.debug('refresh token found. start refresh to backend')
  const response = await axios.post<Response>(
    process.env.BACKEND_API_URL + '/auth/refresh',
    {
      refreshToken: session.refreshToken,
    },
    {
      validateStatus: () => true,
    },
  )
  logger.debug('refresh finished')
  const jsonResponse = response.data
  if (response.status === 200) {
    logger.debug('refresh success. start save new session', { jsonResponse })
    await setSession(jsonResponse.data)
    logger.debug('new session saved. return the response')
    return NextResponse.json(jsonResponse, { status: response.status })
  } else {
    logger.debug('refresh token failed. clear session', { jsonResponse })
    await clearSessionData()
    logger.debug('session cleared. return 401')
    return NextResponse.json(jsonResponse, { status: 401 })
  }
}
