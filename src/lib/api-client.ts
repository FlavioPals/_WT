import 'server-only'

import { cookies } from 'next/headers'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(
  /\/$/,
  ''
)
export const ACCESS_TOKEN_COOKIE = 'accessToken'
export const REFRESH_TOKEN_COOKIE = 'refresh_token'
export const CSRF_COOKIE = 'csrf_token'

// ─── Error ────────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: Array<{ path: string; message: string }>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function summarizeApiError(error: unknown): string {
  if (error instanceof ApiError) return `${error.status} ${error.code}`
  if (error instanceof Error) return error.message
  return 'unknown error'
}

async function parseError(res: Response): Promise<never> {
  let code = 'UNKNOWN_ERROR'
  let message = `Request failed with status ${res.status}`
  let details: Array<{ path: string; message: string }> | undefined

  try {
    const body = await res.json()
    code = body?.error?.code ?? code
    message = body?.error?.message ?? message
    if (Array.isArray(body?.error?.details)) details = body.error.details
  } catch {
    // ignore parse errors
  }

  throw new ApiError(res.status, code, message, details)
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

async function getAccessToken(): Promise<string> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  if (!accessToken) throw new ApiError(401, 'UNAUTHENTICATED', 'Not authenticated')
  return accessToken
}

function getSetCookies(headers: Headers): string[] {
  const headersWithSetCookie = headers as Headers & { getSetCookie?: () => string[] }
  if (typeof headersWithSetCookie.getSetCookie === 'function') {
    return headersWithSetCookie.getSetCookie()
  }

  const cookie = headers.get('set-cookie')
  return cookie ? [cookie] : []
}

async function fetchCsrf(): Promise<{ csrfToken: string; csrfCookie: string }> {
  const res = await fetch(`${API_BASE}/auth/csrf`, { cache: 'no-store' })

  if (!res.ok) throw new ApiError(401, 'CSRF_FAILED', 'Failed to obtain CSRF token')

  const body = (await res.json()) as { data: { csrfToken: string } }
  const csrfToken = body.data.csrfToken

  let csrfCookie = ''
  for (const cookie of getSetCookies(res.headers)) {
    if (cookie.startsWith(`${CSRF_COOKIE}=`)) {
      csrfCookie = cookie.split(';')[0]
      break
    }
  }

  if (!csrfCookie) csrfCookie = `${CSRF_COOKIE}=${csrfToken}`

  return { csrfToken, csrfCookie }
}

// ─── Authenticated GET (server-only) ─────────────────────────────────────────

export async function adminGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<ApiResponse<T>> {
  const accessToken = await getAccessToken()
  const url = new URL(`${API_BASE}${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
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
  const accessToken = await getAccessToken()
  const { csrfToken, csrfCookie } = await fetchCsrf()

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      Cookie: csrfCookie,
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
  const accessToken = await getAccessToken()
  const { csrfToken, csrfCookie } = await fetchCsrf()

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Cookie: csrfCookie,
      'X-CSRF-Token': csrfToken,
    },
    body: formData,
    cache: 'no-store',
  })

  if (!res.ok) await parseError(res)
  return res.json() as Promise<T>
}

export { API_BASE }
