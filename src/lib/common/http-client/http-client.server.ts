import 'server-only'
import { createHttpClient } from './common.http-client'
import axios from 'axios'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

const axiosClient = axios.create({
  baseURL: backendApiUrl,
  validateStatus: () => true,
  adapter: 'fetch',
})
axiosClient.interceptors.request.use(async (config) => {
  // Doesn't intercept 401 request to refresh token since
  // its easier to always let client refreshing users token.
  //
  // It still can be used for server side fetching, with
  // rule: client always owns the data.
  //
  // So, if server side fetching is failed with 401, don't
  // pass it to client. Let client fetching it by themselves
  // since the 401 might be caused by expired token
  return config
})

/**
 * Focus primarily to make request to dedicated backend
 */
const httpClient = createHttpClient(axiosClient)

export default httpClient
