import crypto from 'crypto'
import argon2 from 'argon2'
import { Prisma, Role } from '../../generated/prisma/client'
import { audit } from '../../lib/audit'
import { paginationMeta, paginationSkip, type PaginatedResult } from '../../lib/pagination'
import { prisma } from '../../lib/prisma'
import { AppError } from '../../middlewares/error.middleware'
import type {
  CreateUserInput,
  ResetPasswordInput,
  UpdateUserInput,
  UsersAdminFilters,
} from './users.schemas'

const USER_ADMIN_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
} satisfies Prisma.UserSelect

type AdminUser = Prisma.UserGetPayload<{ select: typeof USER_ADMIN_SELECT }>

const PASSWORD_LOWER = 'abcdefghijkmnopqrstuvwxyz'
const PASSWORD_UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const PASSWORD_DIGITS = '23456789'
const PASSWORD_SYMBOLS = '!@#$%^&*_-+=?'
const PASSWORD_ALPHABET = `${PASSWORD_LOWER}${PASSWORD_UPPER}${PASSWORD_DIGITS}${PASSWORD_SYMBOLS}`

function pickRandom(source: string): string {
  return source[crypto.randomInt(0, source.length)]
}

function shuffleCharacters(chars: string[]): string {
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(0, i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

export function generateTemporaryPassword(): string {
  const required = [
    pickRandom(PASSWORD_LOWER),
    pickRandom(PASSWORD_UPPER),
    pickRandom(PASSWORD_DIGITS),
    pickRandom(PASSWORD_SYMBOLS),
  ]
  const random = Array.from({ length: 16 }, () => pickRandom(PASSWORD_ALPHABET))
  return shuffleCharacters([...required, ...random])
}

async function findUserOrFail(id: string, includeDeleted = false): Promise<AdminUser> {
  const user = await prisma.user.findFirst({
    where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    select: USER_ADMIN_SELECT,
  })
  if (!user) throw new AppError(404, 'NOT_FOUND', 'User not found.')
  return user
}

async function ensureEmailAvailable(email: string, excludeId?: string): Promise<void> {
  const conflict = await prisma.user.findFirst({
    where: { email, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  })
  if (conflict) throw new AppError(409, 'CONFLICT', `Email "${email}" is already in use.`)
}

async function assertNotLastActiveAdmin(user: AdminUser): Promise<void> {
  if (user.role !== Role.ADMIN || !user.active || user.deletedAt) return

  const otherActiveAdmins = await prisma.user.count({
    where: {
      id: { not: user.id },
      role: Role.ADMIN,
      active: true,
      deletedAt: null,
    },
  })

  if (otherActiveAdmins === 0) {
    throw new AppError(
      409,
      'LAST_ACTIVE_ADMIN',
      'This action would remove the last active admin user.'
    )
  }
}

async function revokeRefreshTokens(userId: string): Promise<number> {
  const result = await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  })
  return result.count
}

export async function createUser(
  data: CreateUserInput,
  actorId: string
): Promise<{ user: AdminUser; temporaryPassword: string }> {
  await ensureEmailAvailable(data.email)

  const temporaryPassword = data.temporaryPassword ?? generateTemporaryPassword()
  const hashedPassword = await argon2.hash(temporaryPassword)

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: data.role,
      active: data.active,
      password: hashedPassword,
    },
    select: USER_ADMIN_SELECT,
  })

  await audit({
    actorId,
    action: 'user.create',
    entity: 'User',
    entityId: user.id,
    after: user,
  })

  return { user, temporaryPassword }
}

export async function getUser(id: string): Promise<AdminUser> {
  return findUserOrFail(id)
}

export async function listUsers(filters: UsersAdminFilters): Promise<PaginatedResult<AdminUser>> {
  const { page, limit, sort, direction, q, role, active, deleted } = filters
  const where: Prisma.UserWhereInput = {
    deletedAt: deleted ? { not: null } : null,
    ...(role ? { role } : {}),
    ...(active !== undefined ? { active } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: USER_ADMIN_SELECT,
      orderBy: { [sort]: direction },
      skip: paginationSkip(page, limit),
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return { items, pagination: paginationMeta(total, page, limit) }
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
  actorId: string
): Promise<AdminUser> {
  const existing = await findUserOrFail(id)

  if (data.email && data.email !== existing.email) {
    await ensureEmailAvailable(data.email, id)
  }

  const removesActiveAdmin =
    (data.role !== undefined && data.role !== Role.ADMIN) || data.active === false

  if (removesActiveAdmin) {
    await assertNotLastActiveAdmin(existing)
  }

  const updated = await prisma.user.update({
    where: { id },
    data,
    select: USER_ADMIN_SELECT,
  })

  if (existing.active && data.active === false) {
    await revokeRefreshTokens(id)
  }

  if (data.role !== undefined && data.role !== existing.role) {
    await revokeRefreshTokens(id)
  }

  await audit({
    actorId,
    action: 'user.update',
    entity: 'User',
    entityId: id,
    before: existing,
    after: updated,
  })

  return updated
}

export async function deleteUser(id: string, actorId: string): Promise<void> {
  const existing = await findUserOrFail(id)
  await assertNotLastActiveAdmin(existing)

  await prisma.user.update({
    where: { id },
    data: { active: false, deletedAt: new Date() },
    select: USER_ADMIN_SELECT,
  })

  await revokeRefreshTokens(id)

  await audit({
    actorId,
    action: 'user.delete',
    entity: 'User',
    entityId: id,
    before: existing,
  })
}

export async function resetUserPassword(
  id: string,
  data: ResetPasswordInput,
  actorId: string
): Promise<{ user: AdminUser; temporaryPassword: string }> {
  await findUserOrFail(id)

  const temporaryPassword = data.temporaryPassword ?? generateTemporaryPassword()
  const hashedPassword = await argon2.hash(temporaryPassword)

  const user = await prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: USER_ADMIN_SELECT,
  })

  const revokedSessions = await revokeRefreshTokens(id)

  await audit({
    actorId,
    action: 'user.password.reset',
    entity: 'User',
    entityId: id,
    after: { user, revokedSessions },
  })

  return { user, temporaryPassword }
}

export async function revokeUserSessions(
  id: string,
  actorId: string
): Promise<{ revokedSessions: number }> {
  const user = await findUserOrFail(id)
  const revokedSessions = await revokeRefreshTokens(id)

  await audit({
    actorId,
    action: 'user.sessions.revoke',
    entity: 'User',
    entityId: id,
    before: user,
    after: { revokedSessions },
  })

  return { revokedSessions }
}
