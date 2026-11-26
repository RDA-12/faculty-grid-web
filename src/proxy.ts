import { NextRequest, NextResponse } from 'next/server'
import { getSessionData } from './lib/common/user-session'
import { getLogger } from './lib/common/logger'

const protectedRoutes: string[] = ['/dashboard']
const publicRoutes: string[] = ['/login', '/']

export default async function proxy(req: NextRequest) {
  const logger = getLogger('proxy')

  const path = req.nextUrl.pathname
  const isProtectedRoute =
    protectedRoutes.filter((it) => path.startsWith(it)).length > 0
  const isPublicRoute = publicRoutes.includes(path)

  logger.debug(`desination: ${path} `)
  logger.debug('start get current session')
  const session = await getSessionData()
  logger.debug('current session obtained', { session })
  const authenticated = typeof session.accessToken !== 'undefined'
  logger.debug(`current user is authenticated: ${authenticated}`)

  if (path === '/') {
    if (authenticated) {
      logger.debug(`redirect to dashboard`)
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    logger.debug(`redirect to login`)
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isProtectedRoute && !authenticated) {
    logger.debug(`redirect to login`)
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (
    isPublicRoute &&
    authenticated &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    logger.debug(`redirect to dashboard`)
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  logger.debug(`proceed to destination`)
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - files with extensions (e.g. .png, .jpg, .svg, .css)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\..*).*)',
  ],
}
