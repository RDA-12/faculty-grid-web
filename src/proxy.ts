import { NextRequest, NextResponse } from 'next/server'
import { getUserId } from './lib/common/user-session'

const protectedRoutes: string[] = ['/dashboard']
const publicRoutes: string[] = ['/login', '/']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.includes(path)
  const isPublicRoute = publicRoutes.includes(path)

  const authenticated = (await getUserId()) !== null

  if (path === '/') {
    if (authenticated) {
      return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isProtectedRoute && !authenticated) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (
    isPublicRoute &&
    authenticated &&
    !req.nextUrl.pathname.startsWith('/dashboard')
  ) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
