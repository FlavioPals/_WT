import 'server-only'

import { cookies } from 'next/headers'
import { API_BASE } from '@/lib/api-client'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'ARCHITECT' | 'EDITOR'
  active: boolean
}

// ─── login ────────────────────────────────────────────────────────────────────

export interface LoginResult {
  user: AuthUser
  error?: never
}

export interface LoginError {
  user?: never
  error: string
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
    return { error: 'Serviço indisponível. Tente novamente.' }
  }

  if (!res.ok) {
    return { error: 'E-mail ou senha inválidos.' }
  }

  // Forward Express JWT cookies to the browser
  const cookieStore = await cookies()
  for (const raw of res.headers.getSetCookie()) {
    const [nameValue, ...attrs] = raw.split(';').map((s) => s.trim())
    const eqIdx = nameValue.indexOf('=')
    const name = nameValue.slice(0, eqIdx)
    const value = nameValue.slice(eqIdx + 1)

    const options: Parameters<typeof cookieStore.set>[2] = {}
    for (const attr of attrs) {
      const lower = attr.toLowerCase()
      if (lower === 'httponly') options.httpOnly = true
      else if (lower === 'secure') options.secure = true
      else if (lower.startsWith('samesite='))
        options.sameSite = lower.split('=')[1] as 'lax' | 'strict' | 'none'
      else if (lower.startsWith('path=')) options.path = attr.split('=')[1]
      else if (lower.startsWith('max-age=')) options.maxAge = parseInt(attr.split('=')[1])
    }

    cookieStore.set(name, value, options)
  }

  const body = (await res.json()) as { data: AuthUser }
  return { user: body.data }
}

// ─── logout ───────────────────────────────────────────────────────────────────

export async function callExpressLogout(): Promise<void> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (accessToken) {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { Cookie: `accessToken=${accessToken}` },
      cache: 'no-store',
    }).catch(() => {})
  }

  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')
}

// ─── me ───────────────────────────────────────────────────────────────────────

export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) return null

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Cookie: `accessToken=${accessToken}` },
      cache: 'no-store',
    })

    if (!res.ok) return null
    const body = (await res.json()) as { data: AuthUser }
    return body.data
  } catch {
    return null
  }
}
