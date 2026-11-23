import { createHttpClient } from './common.http-client'

const proxyPrefix = process.env.NEXT_PUBLIC_SITE_URL + '/api/proxy'

/**
 * Focus primarily to make request to internal nextjs proxy route handlers
 */
const httpClient = createHttpClient(proxyPrefix)

export default httpClient
