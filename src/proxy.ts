import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('accessToken')?.value

  if (accessToken) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  const loginUrl = new URL('/login', request.nextUrl)
  loginUrl.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`)

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
}
