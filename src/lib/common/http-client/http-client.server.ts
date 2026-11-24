import 'server-only'
import { getLogger } from '../logger'
import { getSessionData } from '../user-session'
import { createHttpClient } from './common.http-client'
import axios from 'axios'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

const axiosClient = axios.create({
  baseURL: backendApiUrl,
  validateStatus: () => true,
  adapter: 'fetch',
})
axiosClient.interceptors.request.use(async (config) => {
  const logger = getLogger('Axios.server.interceptor')

  logger.debug('get user session')
  const session = await getSessionData()
  logger.debug('session obtained. attach auth header')
  config.headers.set('Authorization', `Bearer ${session.accessToken}`)
  logger.debug('auth header attached. return new config')
  return config
})

/**
 * Focus primarily to make request to dedicated backend
 */
const httpClient = createHttpClient(axiosClient)

export default httpClient
