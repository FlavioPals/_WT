import { Request, Response } from 'express'
import { env } from '../../config/env'
import { asyncHandler } from '../../lib/async-handler'
import { AppError } from '../../middlewares/error.middleware'
import type { LoginInput } from './auth.schemas'
import * as authService from './auth.service'

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
