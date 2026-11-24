import { getLogger } from '@/lib/common/logger'
import { getSessionData } from '@/lib/common/user-session'
import { NextResponse } from 'next/server'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

async function handler(
  request: Request,
  ctx: RouteContext<'/api/proxy/[...path]'>,
) {
  const method = request.method
  const logger = getLogger(`ProxyRouteHandler.${method}`)

  const endpoint = (await ctx.params).path.join('/')

  logger.debug('start getting user session')
  const session = await getSessionData()
  logger.debug('user session obtained. attach to auth header')

  // Clone incoming headers into a mutable Headers object
  const headers = new Headers(request.headers)
  headers.set('Authorization', `Bearer ${session.accessToken}`)
  headers.set('custom', `Bearer ${session.accessToken}`)
  // Remove the original 'host' header so fetch sets the target host properly
  headers.delete('host')
  // Remove unnecessary cookie
  headers.delete('cookie')

  logger.debug('start making request')
  const response = await fetch(`${backendApiUrl}/${endpoint}`, {
    method,
    headers,
    // Only attach body for non-GET/HEAD requests
    body: method !== 'GET' && method !== 'HEAD' ? request.body : undefined,
    // Required by Node.js fetch when forwarding a ReadableStream body
    ...(method !== 'GET' && method !== 'HEAD' ? { duplex: 'half' } : {}),
  })

  logger.debug('request finished. parse json response')
  const responseJson = await response.json()
  logger.debug('json response parsed')

  return NextResponse.json(responseJson, { status: response.status })
}

export { handler as GET, handler as POST }
