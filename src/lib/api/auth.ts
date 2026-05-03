import 'server-only'

import { cookies } from 'next/headers'
import { ACCESS_TOKEN_COOKIE, API_BASE, REFRESH_TOKEN_COOKIE, adminMutate } from '@/lib/api-client'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'ARCHITECT' | 'EDITOR'
  active?: boolean
}

export interface LoginResult {
  user: AuthUser
  error?: never
}

export interface LoginError {
  user?: never
  error: string
}

interface AuthPayload {
  accessToken: string
  user: AuthUser
}

function getSetCookies(headers: Headers): string[] {
  const headersWithSetCookie = headers as Headers & { getSetCookie?: () => string[] }
  if (typeof headersWithSetCookie.getSetCookie === 'function') {
    return headersWithSetCookie.getSetCookie()
  }

  const cookie = headers.get('set-cookie')
  return cookie ? [cookie] : []
}

function parseCookieHeader(raw: string) {
  const [nameValue, ...attrs] = raw.split(';').map((s) => s.trim())
  const eqIdx = nameValue.indexOf('=')
  if (eqIdx === -1) return null

  const options: Parameters<Awaited<ReturnType<typeof cookies>>['set']>[2] = {
    httpOnly: true,
    path: '/',
  }

  for (const attr of attrs) {
    const lower = attr.toLowerCase()
    if (lower === 'httponly') options.httpOnly = true
    else if (lower === 'secure') options.secure = true
    else if (lower.startsWith('samesite=')) {
      options.sameSite = lower.split('=')[1] as 'lax' | 'strict' | 'none'
    } else if (lower.startsWith('max-age=')) {
      const maxAge = Number.parseInt(attr.split('=')[1] ?? '', 10)
      if (Number.isFinite(maxAge)) options.maxAge = maxAge
    }
  }

  return {
    name: nameValue.slice(0, eqIdx),
    value: nameValue.slice(eqIdx + 1),
    options,
  }
}

export async function callExpressLogin(
  email: string,
  password: string
): Promise<LoginResult | LoginError> {
  let res: Response

  try {
    res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    })
  } catch {
    return { error: 'Servico indisponivel. Tente novamente.' }
  }

  if (!res.ok) {
    return { error: 'E-mail ou senha invalidos.' }
  }

  const body = (await res.json()) as { data: AuthPayload }
  const cookieStore = await cookies()

  cookieStore.set(ACCESS_TOKEN_COOKIE, body.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60,
    path: '/',
  })

  for (const raw of getSetCookies(res.headers)) {
    const parsed = parseCookieHeader(raw)
    if (parsed?.name === REFRESH_TOKEN_COOKIE) {
      cookieStore.set(parsed.name, parsed.value, parsed.options)
    }
  }

  return { user: body.data.user }
}

export async function callExpressLogout(): Promise<void> {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value

  if (refreshToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `${REFRESH_TOKEN_COOKIE}=${refreshToken}` },
      cache: 'no-store',
    }).catch(() => {})
  }

  cookieStore.delete(ACCESS_TOKEN_COOKIE)
  cookieStore.delete(REFRESH_TOKEN_COOKIE)
  cookieStore.delete('refreshToken')
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  if (!accessToken) return null

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const body = (await res.json()) as { data: { user: AuthUser } | AuthUser }
    return 'user' in body.data ? body.data.user : body.data
  } catch {
    return null
  }
}

export async function changeOwnPassword(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<void> {
  await adminMutate('POST', '/auth/change-password', data)
}
