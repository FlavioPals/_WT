import { beforeEach, describe, expect, it, vi } from 'vitest'

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('../../config/env', () => ({
  env: {
    JWT_ACCESS_SECRET: 'test-access-secret-must-be-at-least-32-chars',
    JWT_REFRESH_SECRET: 'test-refresh-secret-must-be-at-least-32-chars',
    NODE_ENV: 'test',
  },
}))

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('argon2', () => ({
  default: {
    verify: vi.fn(),
    hash: vi.fn(),
  },
}))

// ─── Imports after mocks ──────────────────────────────────────────────────────

import argon2 from 'argon2'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middlewares/error.middleware'
import { login, logout, refreshTokens } from '../../modules/auth/auth.service'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUser = {
  id: 'user-1',
  email: 'admin@test.com',
  name: 'Admin',
  password: 'hashed-password',
  role: 'ADMIN',
  active: true,
  deletedAt: null,
  lastLoginAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const mockRefreshToken = {
  id: 'rt-1',
  tokenHash: '', // set per test
  userId: 'user-1',
  userAgent: null,
  ip: null,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  revokedAt: null,
  createdAt: new Date(),
  user: mockUser,
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ─ login ──────────────────────────────────────────────────────────────────

  describe('login()', () => {
    it('returns accessToken and refreshToken for valid credentials', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never)
      vi.mocked(argon2.verify).mockResolvedValue(true)
      vi.mocked(prisma.user.update).mockResolvedValue(mockUser as never)
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never)

      const result = await login('admin@test.com', 'correct-password')

      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(result.user.email).toBe('admin@test.com')
      expect(prisma.refreshToken.create).toHaveBeenCalledOnce()
    })

    it('throws UNAUTHORIZED for invalid password', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(mockUser as never)
      vi.mocked(argon2.verify).mockResolvedValue(false)

      await expect(login('admin@test.com', 'wrong-password')).rejects.toThrow(AppError)
      await expect(login('admin@test.com', 'wrong-password')).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    })

    it('throws UNAUTHORIZED for non-existent user', async () => {
      vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
      vi.mocked(argon2.verify).mockResolvedValue(false)

      await expect(login('ghost@test.com', 'any-password')).rejects.toThrow(AppError)
      await expect(login('ghost@test.com', 'any-password')).rejects.toMatchObject({
        statusCode: 401,
      })
    })
  })

  // ─ refreshTokens ──────────────────────────────────────────────────────────

  describe('refreshTokens()', () => {
    it('rotates tokens for a valid refresh token', async () => {
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(mockRefreshToken as never)
      vi.mocked(prisma.refreshToken.update).mockResolvedValue({} as never)
      vi.mocked(prisma.refreshToken.create).mockResolvedValue({} as never)

      const result = await refreshTokens('some-raw-token')

      expect(result.accessToken).toBeDefined()
      expect(result.refreshToken).toBeDefined()
      expect(prisma.refreshToken.update).toHaveBeenCalledOnce() // old token revoked
      expect(prisma.refreshToken.create).toHaveBeenCalledOnce() // new token created
    })

    it('throws UNAUTHORIZED for expired refresh token', async () => {
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue({
        ...mockRefreshToken,
        expiresAt: new Date(Date.now() - 1000), // already expired
      } as never)

      await expect(refreshTokens('expired-token')).rejects.toMatchObject({
        statusCode: 401,
        code: 'UNAUTHORIZED',
      })
    })

    it('throws UNAUTHORIZED when token not found', async () => {
      vi.mocked(prisma.refreshToken.findFirst).mockResolvedValue(null)

      await expect(refreshTokens('unknown-token')).rejects.toMatchObject({
        statusCode: 401,
      })
    })
  })

  // ─ logout ─────────────────────────────────────────────────────────────────

  describe('logout()', () => {
    it('revokes the matching refresh token', async () => {
      vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 1 } as never)

      await logout('some-raw-token')

      expect(prisma.refreshToken.updateMany).toHaveBeenCalledOnce()
      expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { revokedAt: expect.any(Date) } })
      )
    })
  })
})
