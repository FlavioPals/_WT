import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findFirst: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      updateMany: vi.fn(),
    },
  },
}))

vi.mock('../../lib/audit', () => ({
  audit: vi.fn(),
}))

vi.mock('argon2', () => ({
  default: {
    hash: vi.fn(),
  },
}))

import argon2 from 'argon2'
import { Role } from '../../generated/prisma/client'
import { audit } from '../../lib/audit'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middlewares/error.middleware'
import { temporaryPasswordSchema } from '../../modules/users/users.schemas'
import {
  createUser,
  generateTemporaryPassword,
  resetUserPassword,
  updateUser,
} from '../../modules/users/users.service'

const now = new Date('2026-01-01T00:00:00.000Z')

const adminUser = {
  id: 'admin-1',
  email: 'admin@test.com',
  name: 'Admin',
  role: Role.ADMIN,
  active: true,
  lastLoginAt: null,
  createdAt: now,
  updatedAt: now,
  deletedAt: null,
}

describe('users.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('generates temporary passwords that match the security policy', () => {
    const password = generateTemporaryPassword()

    expect(password).toHaveLength(20)
    expect(temporaryPasswordSchema.safeParse(password).success).toBe(true)
  })

  it('creates a user with a hashed temporary password and a safe response', async () => {
    const createdUser = {
      ...adminUser,
      id: 'editor-1',
      email: 'editor@test.com',
      name: 'Editor',
      role: Role.EDITOR,
    }

    vi.mocked(prisma.user.findFirst).mockResolvedValue(null)
    vi.mocked(argon2.hash).mockResolvedValue('hashed-temp-password')
    vi.mocked(prisma.user.create).mockResolvedValue(createdUser as never)

    const result = await createUser(
      {
        email: 'editor@test.com',
        name: 'Editor',
        role: Role.EDITOR,
        active: true,
        temporaryPassword: 'TempPass123!',
      },
      'admin-1'
    )

    expect(argon2.hash).toHaveBeenCalledWith('TempPass123!')
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ password: 'hashed-temp-password' }),
      })
    )
    expect(result.temporaryPassword).toBe('TempPass123!')
    expect(result.user).not.toHaveProperty('password')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'user.create', after: createdUser })
    )
  })

  it('blocks deactivation of the last active admin', async () => {
    vi.mocked(prisma.user.findFirst).mockResolvedValue(adminUser as never)
    vi.mocked(prisma.user.count).mockResolvedValue(0)

    const promise = updateUser('admin-1', { active: false }, 'admin-1')

    await expect(promise).rejects.toBeInstanceOf(AppError)
    await expect(promise).rejects.toMatchObject({
      statusCode: 409,
      code: 'LAST_ACTIVE_ADMIN',
    })
    expect(prisma.user.update).not.toHaveBeenCalled()
  })

  it('revokes sessions after a password reset without exposing the hash', async () => {
    const updatedUser = { ...adminUser, updatedAt: new Date('2026-01-02T00:00:00.000Z') }

    vi.mocked(prisma.user.findFirst).mockResolvedValue(adminUser as never)
    vi.mocked(argon2.hash).mockResolvedValue('hashed-reset-password')
    vi.mocked(prisma.user.update).mockResolvedValue(updatedUser as never)
    vi.mocked(prisma.refreshToken.updateMany).mockResolvedValue({ count: 2 } as never)

    const result = await resetUserPassword(
      'admin-1',
      { temporaryPassword: 'ResetPass123!' },
      'actor-1'
    )

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { password: 'hashed-reset-password' } })
    )
    expect(prisma.refreshToken.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'admin-1', revokedAt: null } })
    )
    expect(result.user).not.toHaveProperty('password')
    expect(audit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'user.password.reset',
        after: { user: updatedUser, revokedSessions: 2 },
      })
    )
  })
})
