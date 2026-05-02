import { ProjectStatus } from '../../generated/prisma/client'
import { audit } from '../../lib/audit'
import { AppError } from '../../middlewares/error.middleware'
import { paginationMeta, paginationSkip, type PaginatedResult } from '../../lib/pagination'
import { prisma } from '../../lib/prisma'
import { revalidateProject } from '../../lib/revalidate'
import { uniqueProjectSlug } from '../../lib/slug'
import type {
  CreateProjectInput,
  ProjectAdminFilters,
  ProjectPublicFilters,
  UpdateProjectInput,
} from './projects.schemas'

// ─── Shared include ───────────────────────────────────────────────────────────

const PROJECT_INCLUDE = {
  images: { where: { deletedAt: null }, orderBy: { order: 'asc' as const } },
  createdBy: { select: { id: true, name: true } },
  updatedBy: { select: { id: true, name: true } },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findOrFail(id: string) {
  const project = await prisma.project.findFirst({
    where: { id, deletedAt: null },
    include: PROJECT_INCLUDE,
  })
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found.')
  return project
}

// ─── Admin operations ─────────────────────────────────────────────────────────

export async function createProject(data: CreateProjectInput, actorId: string) {
  const slug = data.slug ?? (await uniqueProjectSlug(data.title))

  const existing = await prisma.project.findFirst({ where: { slug }, select: { id: true } })
  if (existing) throw new AppError(409, 'CONFLICT', `Slug "${slug}" is already in use.`)

  const project = await prisma.project.create({
    data: {
      ...data,
      slug,
      status: ProjectStatus.DRAFT,
      createdById: actorId,
      updatedById: actorId,
    },
    include: PROJECT_INCLUDE,
  })

  await audit({
    actorId,
    action: 'project.create',
    entity: 'Project',
    entityId: project.id,
    after: project,
  })
  return project
}

export async function getAdminProject(id: string) {
  return findOrFail(id)
}

export async function updateProject(id: string, data: UpdateProjectInput, actorId: string) {
  const existing = await findOrFail(id)

  if (data.slug && data.slug !== existing.slug) {
    const conflict = await prisma.project.findFirst({
      where: { slug: data.slug, id: { not: id } },
      select: { id: true },
    })
    if (conflict) throw new AppError(409, 'CONFLICT', `Slug "${data.slug}" is already in use.`)
  }

  const updated = await prisma.project.update({
    where: { id },
    data: { ...data, updatedById: actorId },
    include: PROJECT_INCLUDE,
  })

  await audit({
    actorId,
    action: 'project.update',
    entity: 'Project',
    entityId: id,
    before: existing,
    after: updated,
  })

  if (updated.status === ProjectStatus.PUBLISHED) {
    await revalidateProject(updated.slug)
  }

  return updated
}

export async function deleteProject(id: string, actorId: string) {
  const existing = await findOrFail(id)

  await prisma.project.update({ where: { id }, data: { deletedAt: new Date() } })

  await audit({
    actorId,
    action: 'project.delete',
    entity: 'Project',
    entityId: id,
    before: existing,
  })
  await revalidateProject(existing.slug)
}

export async function restoreProject(id: string, actorId: string) {
  const project = await prisma.project.findFirst({
    where: { id },
    include: PROJECT_INCLUDE,
  })
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found.')
  if (!project.deletedAt) throw new AppError(409, 'CONFLICT', 'Project is not deleted.')

  const restored = await prisma.project.update({
    where: { id },
    data: { deletedAt: null, updatedById: actorId },
    include: PROJECT_INCLUDE,
  })

  await audit({
    actorId,
    action: 'project.restore',
    entity: 'Project',
    entityId: id,
    after: restored,
  })
  return restored
}

export async function publishProject(id: string, actorId: string) {
  const project = await findOrFail(id)

  const missing: string[] = []
  if (!project.description) missing.push('description')
  if (!project.coverImage) missing.push('coverImage')
  if (missing.length > 0) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Project is missing required fields to publish.', [
      ...missing.map((f) => ({ path: f, message: 'Required to publish.' })),
    ])
  }

  const updated = await prisma.project.update({
    where: { id },
    data: {
      status: ProjectStatus.PUBLISHED,
      publishedAt: project.publishedAt ?? new Date(),
      updatedById: actorId,
    },
    include: PROJECT_INCLUDE,
  })

  await audit({
    actorId,
    action: 'project.publish',
    entity: 'Project',
    entityId: id,
    after: updated,
  })
  await revalidateProject(updated.slug)
  return updated
}

export async function unpublishProject(id: string, actorId: string) {
  const project = await findOrFail(id)

  const updated = await prisma.project.update({
    where: { id },
    data: { status: ProjectStatus.DRAFT, updatedById: actorId },
    include: PROJECT_INCLUDE,
  })

  await audit({
    actorId,
    action: 'project.unpublish',
    entity: 'Project',
    entityId: id,
    before: project,
  })
  await revalidateProject(updated.slug)
  return updated
}

export async function reorderProjects(ids: string[]) {
  await prisma.$transaction(
    ids.map((id, index) => prisma.project.update({ where: { id }, data: { order: index } }))
  )
}

export async function listAdminProjects(
  filters: ProjectAdminFilters
): Promise<PaginatedResult<unknown>> {
  const { page, limit, sort, direction, category, featured, status, deleted } = filters

  const where = {
    deletedAt: deleted ? { not: null } : null,
    ...(category ? { category } : {}),
    ...(featured !== undefined ? { featured } : {}),
    ...(status ? { status } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: PROJECT_INCLUDE,
      orderBy: { [sort]: direction },
      skip: paginationSkip(page, limit),
      take: limit,
    }),
    prisma.project.count({ where }),
  ])

  return { items, pagination: paginationMeta(total, page, limit) }
}

// ─── Public operations ────────────────────────────────────────────────────────

export async function getPublicProject(slug: string) {
  const project = await prisma.project.findFirst({
    where: { slug, status: ProjectStatus.PUBLISHED, deletedAt: null },
    include: {
      images: { where: { deletedAt: null }, orderBy: { order: 'asc' as const } },
    },
  })
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found.')
  return project
}

export async function listPublicProjects(
  filters: ProjectPublicFilters
): Promise<PaginatedResult<unknown>> {
  const { page, limit, sort, direction, category, featured } = filters

  const where = {
    status: ProjectStatus.PUBLISHED,
    deletedAt: null,
    ...(category ? { category } : {}),
    ...(featured !== undefined ? { featured } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        images: { where: { deletedAt: null }, orderBy: { order: 'asc' as const } },
      },
      orderBy: { [sort]: direction },
      skip: paginationSkip(page, limit),
      take: limit,
    }),
    prisma.project.count({ where }),
  ])

  return { items, pagination: paginationMeta(total, page, limit) }
}
