import 'server-only'

import { cookies } from 'next/headers'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1'

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function parseError(res: Response): Promise<never> {
  let code = 'UNKNOWN_ERROR'
  let message = `Request failed with status ${res.status}`

  try {
    const body = await res.json()
    code = body?.error?.code ?? code
    message = body?.error?.message ?? message
  } catch {
    // ignore parse errors
  }

  throw new ApiError(res.status, code, message)
}

// ─── Pagination & response types ──────────────────────────────────────────────

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  pagination?: Pagination
}

// ─── Public (no auth) ─────────────────────────────────────────────────────────

export async function publicGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> {
  const url = new URL(`${API_BASE}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 },
  })

  if (!res.ok) await parseError(res)
  return res.json() as Promise<ApiResponse<T>>
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function getAuthCookie(): Promise<string> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  if (!accessToken) throw new ApiError(401, 'UNAUTHENTICATED', 'Not authenticated')
  return accessToken
}

async function fetchCsrf(accessToken: string): Promise<{ csrfToken: string; csrfCookie: string }> {
  const res = await fetch(`${API_BASE}/auth/csrf`, {
    headers: { Cookie: `accessToken=${accessToken}` },
    cache: 'no-store',
  })

  if (!res.ok) throw new ApiError(401, 'CSRF_FAILED', 'Failed to obtain CSRF token')

  const body = (await res.json()) as { data: { csrfToken: string } }
  const csrfToken = body.data.csrfToken

  let csrfCookie = ''
  for (const cookie of res.headers.getSetCookie()) {
    if (cookie.startsWith('_csrf=')) {
      csrfCookie = cookie.split(';')[0]
      break
    }
  }

  return { csrfToken, csrfCookie }
}

// ─── Authenticated GET (server-only) ─────────────────────────────────────────

export async function adminGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> {
  const accessToken = await getAuthCookie()
  const url = new URL(`${API_BASE}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Cookie: `accessToken=${accessToken}` },
    cache: 'no-store',
  })

  if (!res.ok) await parseError(res)
  return res.json() as Promise<ApiResponse<T>>
}

// ─── Authenticated mutation (server-only, with CSRF) ─────────────────────────

export async function adminMutate<T>(
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  path: string,
  body?: unknown
): Promise<T | null> {
  const accessToken = await getAuthCookie()
  const { csrfToken, csrfCookie } = await fetchCsrf(accessToken)

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${accessToken}; ${csrfCookie}`,
      'X-CSRF-Token': csrfToken,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })

  if (res.status === 204) return null
  if (!res.ok) await parseError(res)
  return res.json() as Promise<T>
}

// ─── Multipart upload (server-only, with CSRF) ───────────────────────────────

export async function adminUpload<T>(path: string, formData: FormData): Promise<T> {
  const accessToken = await getAuthCookie()
  const { csrfToken, csrfCookie } = await fetchCsrf(accessToken)

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Cookie: `accessToken=${accessToken}; ${csrfCookie}`,
      'X-CSRF-Token': csrfToken,
    },
    body: formData,
    cache: 'no-store',
  })

  if (!res.ok) await parseError(res)
  return res.json() as Promise<T>
}

export { API_BASE }
