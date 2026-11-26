import axios from 'axios'
import { createHttpClient, type RetryAxiosConfig } from './common.http-client'
import { getLogger } from '../logger'

const myUrl = process.env.NEXT_PUBLIC_SITE_URL
const proxyPrefix = myUrl + '/api/proxy'

const axiosClient = axios.create({
  baseURL: proxyPrefix,
  validateStatus: () => true,
  adapter: 'fetch',
})
axiosClient.interceptors.response.use(async (response) => {
  const logger = getLogger('Axios.browser.response.interceptor')

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
  const refreshAxios = axios.create({
    baseURL: myUrl,
    validateStatus: () => true,
  })
  logger.debug('start get new token')
  const refreshResponse = await refreshAxios.post('/api/auth/refresh')
  if (refreshResponse.status != 200) {
    logger.debug('refresh token failed. return original response', {
      refreshResponse,
    })
    return response
  }
  logger.debug('refresh token success. retry the request', { refreshResponse })
  return axiosClient(originalConfig)
})

/**
 * Focus primarily to make request to internal nextjs proxy route handlers
 */
const httpClient = createHttpClient(axiosClient)

export default httpClient
