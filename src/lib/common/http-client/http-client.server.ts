import 'server-only'
import { getLogger } from '../logger'
import { getSessionData } from '../user-session'
import { createHttpClient, type RetryAxiosConfig } from './common.http-client'
import axios from 'axios'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

const axiosClient = axios.create({
  baseURL: backendApiUrl,
  validateStatus: () => true,
  adapter: 'fetch',
})
axiosClient.interceptors.request.use(async (config) => {
  const logger = getLogger('Axios.server.request.interceptor')

  if ((config as RetryAxiosConfig)._retry) return config

  logger.debug('get user session')
  const session = await getSessionData()
  logger.debug('session obtained. attach auth header')
  config.headers.set('Authorization', `Bearer ${session.accessToken}`)
  logger.debug('auth header attached. return new config')
  return config
})
axiosClient.interceptors.response.use(async (response) => {
  const logger = getLogger('Axios.server.response.interceptor')

  if (response.status !== 401) return response

  const originalConfig: RetryAxiosConfig = response.config
  logger.debug('response failed with 401')
  if (originalConfig._retry) {
    logger.debug('request already retried. return the response')
    // Early return when the request already retried
    return response
  }

  logger.debug('try refresh the token')
  originalConfig._retry = true
  logger.debug('start get session data')
  const session = await getSessionData()
  logger.debug('session obtained')

  if (!session.refreshToken) {
    logger.debug('refresh token not found. forward original response')
    return response
  }

  logger.debug('refresh token found. start retry the request')
  const refreshAxios = axios.create({
    baseURL: backendApiUrl,
    validateStatus: () => true,
  })
  const refreshResponse = await refreshAxios.post('/auth/refresh', {
    refreshToken: session.refreshToken,
  })
  if (refreshResponse.status !== 200) {
    logger.debug('refresh token failed. return original response')
    return response
  }

  // TODO(RDA12): save refreshed token
  // cannot call saveSession directly as the function uses cookie.set
  // inside which can only be invoked on route handler/server action
  // possible solutions:
  // 1. early cath on proxy, can't do that. It will easily have
  // race condition since the refreh token is rotated by server
  logger.debug('refresh token success. retry request')
  const data = refreshResponse.data
  originalConfig.headers!.Authorization = `Bearer ${data.accessToken}`
  return axiosClient(originalConfig)
})

/**
 * Focus primarily to make request to dedicated backend
 */
const httpClient = createHttpClient(axiosClient)

export default httpClient
