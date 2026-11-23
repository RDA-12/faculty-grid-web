import { clearSessionData } from '@/lib/common/user-session'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  await clearSessionData()

  // Redirect to login
  return NextResponse.redirect(new URL('/login', request.url))
}
