import * as browser from './http-client.browser'
import * as server from './http-client.server'

const httpClient =
  typeof window === 'undefined' ? server.default : browser.default

export default httpClient
