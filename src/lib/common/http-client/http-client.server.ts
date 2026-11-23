import { getSessionData } from '../user-session'
import { createHttpClient } from './common.http-client'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

/**
 * Focus primarily to make request to dedicated backend
 */
const httpClient = createHttpClient(backendApiUrl, async () => {
  const session = await getSessionData()
  return {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }
})

export default httpClient
