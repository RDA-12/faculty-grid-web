import axios from 'axios'
import { createHttpClient } from './common.http-client'

const proxyPrefix = process.env.NEXT_PUBLIC_SITE_URL + '/api/proxy'

const axiosClient = axios.create({
  baseURL: proxyPrefix,
  validateStatus: () => true,
  adapter: 'fetch',
})

/**
 * Focus primarily to make request to internal nextjs proxy route handlers
 */
const httpClient = createHttpClient(axiosClient)

export default httpClient
