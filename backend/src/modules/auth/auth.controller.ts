import { Request, Response } from 'express'
import { env } from '../../config/env'
import { asyncHandler } from '../../lib/async-handler'
import { generateCsrfToken } from '../../lib/csrf'
import { AppError } from '../../middlewares/error.middleware'
import type { ChangeOwnPasswordInput, LoginInput } from './auth.schemas'
import * as authService from './auth.service'

const CSRF_COOKIE = 'csrf_token'
const CSRF_COOKIE_MAX_AGE = 60 * 60 * 1000 // 1 hour

const REFRESH_COOKIE = 'refresh_token'
const REFRESH_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000

function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE, token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_COOKIE_MAX_AGE,
    path: '/api/v1/auth',
  })
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE, { path: '/api/v1/auth' })
}

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginInput
  const result = await authService.login(email, password, req.headers['user-agent'], req.ip)
  setRefreshCookie(res, result.refreshToken)
  res.json({ data: { accessToken: result.accessToken, user: result.user }, meta: meta(req) })
})

export const refresh = asyncHandler(async (req, res) => {
  const rawToken = req.cookies[REFRESH_COOKIE] as string | undefined
  if (!rawToken) throw new AppError(401, 'UNAUTHORIZED', 'No refresh token.')

  const result = await authService.refreshTokens(rawToken, req.headers['user-agent'], req.ip)
  setRefreshCookie(res, result.refreshToken)
  res.json({ data: { accessToken: result.accessToken, user: result.user }, meta: meta(req) })
})

export const logout = asyncHandler(async (req, res) => {
  const rawToken = req.cookies[REFRESH_COOKIE] as string | undefined
  if (rawToken) await authService.logout(rawToken)
  clearRefreshCookie(res)
  res.json({ data: { message: 'Logged out.' }, meta: meta(req) })
})

export const logoutAll = asyncHandler(async (req, res) => {
  await authService.logoutAll(req.user!.id)
  clearRefreshCookie(res)
  res.json({ data: { message: 'All sessions revoked.' }, meta: meta(req) })
})

export const me = asyncHandler(async (req, res) => {
  res.json({ data: { user: req.user }, meta: meta(req) })
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body as ChangeOwnPasswordInput
  await authService.changeOwnPassword(req.user!.id, currentPassword, newPassword)
  res.json({ data: { message: 'Password changed.' }, meta: meta(req) })
})

export const getCsrf = asyncHandler(async (req, res) => {
  const token = generateCsrfToken()
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false, // must be readable by JS to send in X-CSRF-Token header
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: CSRF_COOKIE_MAX_AGE,
    path: '/',
  })
  res.json({ data: { csrfToken: token }, meta: meta(req) })
})
