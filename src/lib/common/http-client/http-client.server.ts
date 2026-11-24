import 'server-only'
import { getLogger } from '../logger'
import { getSessionData } from '../user-session'
import { createHttpClient } from './common.http-client'

const backendApiUrl = process.env.BACKEND_API_URL ?? 'http://localhost:8000'

/**
 * Focus primarily to make request to dedicated backend
 */
const httpClient = createHttpClient(backendApiUrl, async () => {
  const logger = getLogger('httpClient.server.optionBuilder')

  logger.debug('get user session data')
  const session = await getSessionData()

  logger.debug('attach Authorization header with access token')
  return {
    headers: {
      Authorization: `Bearer ${session.accessToken}`,
    },
  }
})

export default httpClient
