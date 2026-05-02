import crypto from 'crypto'
import argon2 from 'argon2'
import { JWTPayload, SignJWT, jwtVerify } from 'jose'
import { env } from '../../config/env'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middlewares/error.middleware'

const ACCESS_SECRET = new TextEncoder().encode(env.JWT_ACCESS_SECRET)
const ACCESS_TOKEN_TTL = '15m'
const REFRESH_TOKEN_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

export interface AuthTokenPayload extends JWTPayload {
  sub: string
  email: string
  name: string
  role: string
}

export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
}

// ─── Token helpers ────────────────────────────────────────────────────────────

export async function signAccessToken(user: AuthUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_TTL)
    .sign(ACCESS_SECRET)
}

export async function verifyAccessToken(token: string): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, ACCESS_SECRET)
  return payload as AuthTokenPayload
}

function createRefreshToken(): { raw: string; hash: string } {
  const raw = crypto.randomBytes(40).toString('hex')
  const hash = crypto.createHash('sha256').update(raw).digest('hex')
  return { raw, hash }
}

// ─── Auth operations ──────────────────────────────────────────────────────────

export async function login(
  email: string,
  password: string,
  userAgent?: string,
  ip?: string
): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
  const user = await prisma.user.findFirst({
    where: { email, active: true, deletedAt: null },
  })

  // Constant-time path: always verify to prevent user enumeration
  const dummyHash =
    '$argon2id$v=19$m=65536,t=3,p=4$dummysaltdummysalt$dummyhashvaluedummyhashvaluedummyh'
  const valid = user
    ? await argon2.verify(user.password, password)
    : await argon2.verify(dummyHash, password).catch(() => false)

  if (!user || !valid) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid credentials.')
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })

  const authUser: AuthUser = { id: user.id, email: user.email, name: user.name, role: user.role }
  const accessToken = await signAccessToken(authUser)
  const { raw, hash } = createRefreshToken()

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hash,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  })

  return { accessToken, refreshToken: raw, user: authUser }
}

export async function refreshTokens(
  rawToken: string,
  userAgent?: string,
  ip?: string
): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex')

  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash: hash, revokedAt: null },
    include: { user: true },
  })

  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired refresh token.')
  }

  if (!stored.user.active || stored.user.deletedAt) {
    throw new AppError(401, 'UNAUTHORIZED', 'Account is inactive.')
  }

  // Revoke old token (rotation)
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } })

  const authUser: AuthUser = {
    id: stored.user.id,
    email: stored.user.email,
    name: stored.user.name,
    role: stored.user.role,
  }

  const accessToken = await signAccessToken(authUser)
  const { raw, hash: newHash } = createRefreshToken()

  await prisma.refreshToken.create({
    data: {
      userId: authUser.id,
      tokenHash: newHash,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  })

  return { accessToken, refreshToken: raw, user: authUser }
}

export async function logout(rawToken: string): Promise<void> {
  const hash = crypto.createHash('sha256').update(rawToken).digest('hex')
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hash, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
}
