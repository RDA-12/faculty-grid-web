import { getLogger } from '@/lib/common/logger'
import { getSessionData } from '@/lib/common/user-session'
import axios, { type AxiosRequestConfig } from 'axios'
import { NextResponse } from 'next/server'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

const axiosInstance = axios.create({ baseURL: backendApiUrl })

async function handler(
  req: Request,
  ctx: RouteContext<'/api/proxy/[...path]'>,
) {
  const method = req.method
  const logger = getLogger(`ProxyRouteHandler.${method}`)

  const endpoint = (await ctx.params).path.join('/')

  logger.debug('start getting user session')
  const session = await getSessionData()
  logger.debug('user session obtained. convert request headers to plain record')
  // Convert Headers object to a plain key-value record
  const headers: Record<string, string> = {}
  req.headers.forEach((value, key) => {
    headers[key] = value
  })
  logger.debug('headers converted. attach auth header')
  headers['Authorization'] = `Bearer ${session.accessToken}`

  // Read the body if the method supports one (GET/HEAD cannot have a body)
  logger.debug('auth header attached')
  let data: any = undefined
  if (req.body && req.method !== 'GET' && req.method !== 'HEAD') {
    logger.debug('request has body. clone it and get the array buffer')
    // Clone the request so the original stream isn't locked/consumed if reused
    data = await req.clone().arrayBuffer()
    logger.debug('body cloned and in array buffer format')
  }

  // Build the AxiosRequestConfig
  logger.debug('construct axios config')
  const config: AxiosRequestConfig = {
    url: '/' + endpoint,
    method: req.method,
    headers,
    data,
    signal: req.signal,
    validateStatus: () => true,
  }
  logger.debug('axios config constructed')

  logger.debug('start making request')
  const response = await axiosInstance.request(config)

  logger.debug('request finished. forward the response data')
  return NextResponse.json(response.data, { status: response.status })
}

export { handler as GET, handler as POST }
