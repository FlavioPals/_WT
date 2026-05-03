import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(
  /\/$/,
  ''
)
const ACCESS_TOKEN_COOKIE = 'accessToken'
const REFRESH_TOKEN_COOKIE = 'refresh_token'

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL('/login', request.nextUrl)
  loginUrl.searchParams.set('callbackUrl', `${request.nextUrl.pathname}${request.nextUrl.search}`)

  const response = NextResponse.redirect(loginUrl)
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
  return response
}

function getSetCookies(headers: Headers): string[] {
  const headersWithSetCookie = headers as Headers & { getSetCookie?: () => string[] }
  if (typeof headersWithSetCookie.getSetCookie === 'function') {
    return headersWithSetCookie.getSetCookie()
  }

  const cookie = headers.get('set-cookie')
  return cookie ? [cookie] : []
}

function refreshCookieOptions(raw: string) {
  const options: {
    httpOnly: boolean
    secure: boolean
    sameSite: 'lax' | 'strict' | 'none'
    path: string
    maxAge: number
  } = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  }

  for (const attr of raw.split(';').map((part) => part.trim())) {
    const lower = attr.toLowerCase()
    if (lower === 'secure') options.secure = true
    else if (lower.startsWith('samesite=')) {
      options.sameSite = lower.split('=')[1] as 'lax' | 'strict' | 'none'
    } else if (lower.startsWith('max-age=')) {
      const maxAge = Number.parseInt(attr.split('=')[1] ?? '', 10)
      if (Number.isFinite(maxAge)) options.maxAge = maxAge
    }
  }

  return options
}

async function refreshAccessToken(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value
  if (!refreshToken) return null

  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const body = (await res.json()) as { data: { accessToken: string } }
    const response = NextResponse.next()

    response.cookies.set(ACCESS_TOKEN_COOKIE, body.data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60,
      path: '/',
    })

    for (const raw of getSetCookies(res.headers)) {
      if (!raw.startsWith(`${REFRESH_TOKEN_COOKIE}=`)) continue
      const [nameValue] = raw.split(';')
      const [, value] = nameValue.split('=')
      response.cookies.set(REFRESH_TOKEN_COOKIE, value, refreshCookieOptions(raw))
    }

    return response
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    return NextResponse.next()
  }

  const refreshed = await refreshAccessToken(request)
  if (refreshed) return refreshed

  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 })
  }

  return redirectToLogin(request)
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/admin/:path*'],
}
