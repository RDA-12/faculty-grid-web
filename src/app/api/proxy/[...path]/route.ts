import { getLogger } from '@/lib/common/logger'
import { getSessionData } from '@/lib/common/user-session'
import { redirect } from 'next/navigation'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

const publicPath = ['/auth/login']

async function handler(
  request: Request,
  ctx: RouteContext<'/api/proxy/[...path]'>,
) {
  const method = request.method
  const logger = getLogger(`ProxyRouteHandler.${method}`)

  const endpoint = (await ctx.params).path.join('/')
  const isPublic = publicPath.includes(endpoint)

  if (!isPublic) {
    logger.debug('path is protected. attach auth header')
    logger.debug('start getting user session')
    const session = await getSessionData()
    if (!session.accessToken) {
      logger.debug('access token not found. redirect to login')
      redirect('/login')
    }
    logger.debug('access token found. attach to auth header')
    request.headers.append('Authorization', `Bearer ${session.accessToken}`)
  }

  logger.debug('start making request')
  const response = await fetch(backendApiUrl + endpoint, request)
  logger.debug('request finished. parse json response')
  const responseJson = await response.json()
  logger.debug('json response parsed')
  return responseJson
}

export { handler as GET, handler as POST }
