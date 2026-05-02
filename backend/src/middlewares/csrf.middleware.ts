import { NextFunction, Request, Response } from 'express'
import { verifyCsrfToken } from '../lib/csrf'

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])
const CSRF_COOKIE = 'csrf_token'
const CSRF_HEADER = 'x-csrf-token'

/**
 * Double-submit CSRF protection for state-mutating requests.
 * Requires both the `csrf_token` cookie and `X-CSRF-Token` header to be present,
 * identical, and carry a valid HMAC signature.
 *
 * Apply to: authenticated admin routes and any cookie-based mutating endpoint.
 * Skip:     GET/HEAD/OPTIONS, public routes, /auth/login, /auth/refresh.
 */
export function csrf(req: Request, res: Response, next: NextFunction): void {
  if (SAFE_METHODS.has(req.method)) {
    next()
    return
  }

  const cookieToken = req.cookies[CSRF_COOKIE] as string | undefined
  const headerToken = req.headers[CSRF_HEADER] as string | undefined

  if (!cookieToken || !headerToken) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'CSRF token missing.' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    })
    return
  }

  // Double-submit: header must equal cookie value
  if (cookieToken !== headerToken) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'CSRF token mismatch.' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    })
    return
  }

  // Signature check prevents token forgery
  if (!verifyCsrfToken(headerToken)) {
    res.status(403).json({
      error: { code: 'FORBIDDEN', message: 'Invalid CSRF token signature.' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    })
    return
  }

  next()
}
