import type { Express } from 'express'
import { cloudinary } from '../../config/cloudinary'
import { env } from '../../config/env'
import { audit } from '../../lib/audit'
import { paginationMeta, paginationSkip, type PaginatedResult } from '../../lib/pagination'
import { prisma } from '../../lib/prisma'
import { uniqueTeamMemberSlug } from '../../lib/slug'
import {
  getImageDimensions,
  uploadToCloudinary,
  validateImageDimensions,
  validateMagicBytes,
  validateUploadFileSize,
} from '../../lib/upload'
import { AppError } from '../../middlewares/error.middleware'
import type {
  CreateTeamMemberInput,
  ReorderTeamInput,
  TeamAdminFilters,
  TeamPublicFilters,
  UpdateTeamMemberInput,
} from './team.schemas'

const TEAM_SELECT_PUBLIC = {
  id: true,
  slug: true,
  name: true,
  role: true,
  bio: true,
  photoUrl: true,
  email: true,
  instagramUrl: true,
  linkedinUrl: true,
  order: true,
} as const

async function findOrFail(id: string) {
  const member = await prisma.teamMember.findFirst({ where: { id, deletedAt: null } })
  if (!member) throw new AppError(404, 'NOT_FOUND', 'Team member not found.')
  return member
}

async function ensureSlugAvailable(slug: string, excludeId?: string) {
  const conflict = await prisma.teamMember.findFirst({
    where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
    select: { id: true },
  })
  if (conflict) throw new AppError(409, 'CONFLICT', `Slug "${slug}" is already in use.`)
}

export async function createTeamMember(data: CreateTeamMemberInput, actorId: string) {
  const slug = data.slug ?? (await uniqueTeamMemberSlug(data.name))
  await ensureSlugAvailable(slug)

  const member = await prisma.teamMember.create({
    data: { ...data, slug },
  })

  await audit({
    actorId,
    action: 'team-member.create',
    entity: 'TeamMember',
    entityId: member.id,
    after: member,
  })

  return member
}

export async function getAdminTeamMember(id: string) {
  return findOrFail(id)
}

export async function updateTeamMember(id: string, data: UpdateTeamMemberInput, actorId: string) {
  const existing = await findOrFail(id)

  if (data.slug && data.slug !== existing.slug) {
    await ensureSlugAvailable(data.slug, id)
  }

  const updated = await prisma.teamMember.update({
    where: { id },
    data,
  })

  await audit({
    actorId,
    action: 'team-member.update',
    entity: 'TeamMember',
    entityId: id,
    before: existing,
    after: updated,
  })

  return updated
}

export async function deleteTeamMember(id: string, actorId: string) {
  const existing = await findOrFail(id)

  await prisma.teamMember.update({
    where: { id },
    data: { active: false, deletedAt: new Date() },
  })

  await audit({
    actorId,
    action: 'team-member.delete',
    entity: 'TeamMember',
    entityId: id,
    before: existing,
  })
}

export async function reorderTeam(input: ReorderTeamInput, actorId: string) {
  const uniqueIds = [...new Set(input.ids)]

  if (uniqueIds.length !== input.ids.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Team member ids must be unique.')
  }

  const members = await prisma.teamMember.findMany({
    where: { id: { in: uniqueIds }, deletedAt: null },
    select: { id: true },
  })

  if (members.length !== uniqueIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'All ids must belong to active team members.')
  }

  await prisma.$transaction(
    uniqueIds.map((id, index) =>
      prisma.teamMember.update({ where: { id }, data: { order: index } })
    )
  )

  await audit({
    actorId,
    action: 'team-member.reorder',
    entity: 'TeamMember',
    after: { ids: uniqueIds },
  })
}

export async function uploadTeamMemberPhoto(
  id: string,
  file: Express.Multer.File | undefined,
  actorId: string
) {
  if (!file) throw new AppError(400, 'VALIDATION_ERROR', 'No photo provided.')

  const existing = await findOrFail(id)

  validateUploadFileSize(file.size)
  await validateMagicBytes(file.buffer)
  const dimensions = await getImageDimensions(file.buffer)
  validateImageDimensions(dimensions)

  const result = await uploadToCloudinary(file.buffer, {
    folder: `${env.CLOUDINARY_FOLDER}/team`,
    resource_type: 'image',
  })

  if (existing.photoPublicId) {
    await cloudinary.uploader.destroy(existing.photoPublicId)
  }

  const updated = await prisma.teamMember.update({
    where: { id },
    data: {
      photoUrl: result.secure_url,
      photoPublicId: result.public_id,
    },
  })

  await audit({
    actorId,
    action: 'team-member.photo.update',
    entity: 'TeamMember',
    entityId: id,
    before: { photoUrl: existing.photoUrl, photoPublicId: existing.photoPublicId },
    after: { photoUrl: updated.photoUrl, photoPublicId: updated.photoPublicId },
  })

  return updated
}

export async function listAdminTeamMembers(
  filters: TeamAdminFilters
): Promise<PaginatedResult<unknown>> {
  const { page, limit, sort, direction, active, deleted } = filters
  const where = {
    deletedAt: deleted ? { not: null } : null,
    ...(active !== undefined ? { active } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.teamMember.findMany({
      where,
      orderBy: { [sort]: direction },
      skip: paginationSkip(page, limit),
      take: limit,
    }),
    prisma.teamMember.count({ where }),
  ])

  return { items, pagination: paginationMeta(total, page, limit) }
}

export async function listPublicTeamMembers(
  filters: TeamPublicFilters
): Promise<PaginatedResult<unknown>> {
  const { page, limit, sort, direction } = filters
  const where = { active: true, deletedAt: null }

  const [items, total] = await Promise.all([
    prisma.teamMember.findMany({
      where,
      select: TEAM_SELECT_PUBLIC,
      orderBy: { [sort]: direction },
      skip: paginationSkip(page, limit),
      take: limit,
    }),
    prisma.teamMember.count({ where }),
  ])

  return { items, pagination: paginationMeta(total, page, limit) }
}
