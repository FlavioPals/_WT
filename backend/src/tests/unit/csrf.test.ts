import { NextFunction, Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../config/env', () => ({
  env: { CSRF_SECRET: 'test-csrf-secret-exactly-32-chars!' },
}))

import { generateCsrfToken, verifyCsrfToken } from '../../lib/csrf'
import { csrf } from '../../middlewares/csrf.middleware'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeReq(
  method: string,
  overrides: Partial<{ cookies: Record<string, string>; headers: Record<string, string> }> = {}
): Request {
  return {
    method,
    cookies: overrides.cookies ?? {},
    headers: overrides.headers ?? {},
    requestId: 'test-req-id',
  } as unknown as Request
}

function makeRes(): {
  res: Response
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
} {
  const json = vi.fn()
  const status = vi.fn().mockReturnValue({ json })
  const res = { status, json, cookie: vi.fn() } as unknown as Response
  return { res, status, json }
}

// ─── Token utility tests ──────────────────────────────────────────────────────

describe('generateCsrfToken() / verifyCsrfToken()', () => {
  it('generates a token in nonce.signature format', () => {
    const token = generateCsrfToken()
    const parts = token.split('.')
    expect(parts).toHaveLength(2)
    expect(parts[0]).toHaveLength(32) // 16 bytes as hex
    expect(parts[1]).toHaveLength(64) // sha256 as hex
  })

  it('verifies a freshly generated token', () => {
    const token = generateCsrfToken()
    expect(verifyCsrfToken(token)).toBe(true)
  })

  it('rejects a token with tampered nonce', () => {
    const token = generateCsrfToken()
    const [, sig] = token.split('.')
    expect(verifyCsrfToken(`deadbeefdeadbeefdeadbeefdeadbeef.${sig}`)).toBe(false)
  })

  it('rejects a token with tampered signature', () => {
    const token = generateCsrfToken()
    const [nonce] = token.split('.')
    expect(
      verifyCsrfToken(`${nonce}.aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`)
    ).toBe(false)
  })

  it('rejects a malformed token (no separator)', () => {
    expect(verifyCsrfToken('notavalidtoken')).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(verifyCsrfToken('')).toBe(false)
  })
})

// ─── Middleware tests ─────────────────────────────────────────────────────────

describe('csrf middleware', () => {
  let next: NextFunction

  beforeEach(() => {
    next = vi.fn()
  })

  it('passes GET requests without any CSRF token', () => {
    const req = makeReq('GET')
    const { res } = makeRes()
    csrf(req, res, next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('blocks POST when both cookie and header are missing', () => {
    const req = makeReq('POST')
    const { res, status, json } = makeRes()
    csrf(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.objectContaining({ code: 'FORBIDDEN' }) })
    )
  })

  it('blocks POST when header is missing but cookie is present', () => {
    const token = generateCsrfToken()
    const req = makeReq('POST', { cookies: { csrf_token: token } })
    const { res, status } = makeRes()
    csrf(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
  })

  it('blocks POST when cookie and header do not match', () => {
    const tokenA = generateCsrfToken()
    const tokenB = generateCsrfToken()
    const req = makeReq('POST', {
      cookies: { csrf_token: tokenA },
      headers: { 'x-csrf-token': tokenB },
    })
    const { res, status } = makeRes()
    csrf(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
  })

  it('blocks POST when token signature is invalid', () => {
    const fake =
      'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
    const req = makeReq('POST', {
      cookies: { csrf_token: fake },
      headers: { 'x-csrf-token': fake },
    })
    const { res, status } = makeRes()
    csrf(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
  })

  it('passes POST with valid matching token in cookie and header', () => {
    const token = generateCsrfToken()
    const req = makeReq('POST', {
      cookies: { csrf_token: token },
      headers: { 'x-csrf-token': token },
    })
    const { res } = makeRes()
    csrf(req, res, next)
    expect(next).toHaveBeenCalledOnce()
  })

  it('applies to DELETE requests as well', () => {
    const req = makeReq('DELETE')
    const { res, status } = makeRes()
    csrf(req, res, next)
    expect(next).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
  })
})
