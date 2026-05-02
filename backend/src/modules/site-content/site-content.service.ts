import type { Express } from 'express'
import { Prisma, SiteContentType } from '../../generated/prisma/client'
import { audit } from '../../lib/audit'
import { prisma } from '../../lib/prisma'
import { revalidateSiteContent } from '../../lib/revalidate'
import { sanitizeRichText } from '../../lib/sanitize-html'
import { AppError } from '../../middlewares/error.middleware'
import type { UploadMediaBody } from '../media/media.schemas'
import { uploadMediaAssets } from '../media/media.service'
import type {
  BulkUpdateSiteContentInput,
  SiteContentAdminFilters,
  SiteContentPublicFilters,
  UpdateSiteContentInput,
} from './site-content.schemas'

type SiteContentRecord = NonNullable<Awaited<ReturnType<typeof findByKey>>>

const PUBLIC_SELECT = {
  key: true,
  value: true,
  type: true,
  group: true,
  label: true,
  metadata: true,
  updatedAt: true,
} as const

function isPlainJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function validateValueForType(type: SiteContentType, rawValue: string): string {
  const value = rawValue.trim()

  switch (type) {
    case SiteContentType.RICH_TEXT:
      return sanitizeRichText(value)

    case SiteContentType.URL:
    case SiteContentType.IMAGE:
      try {
        new URL(value)
      } catch {
        throw new AppError(400, 'VALIDATION_ERROR', 'Content value must be a valid URL.')
      }
      return value

    case SiteContentType.EMAIL: {
      const parsed = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      if (!parsed)
        throw new AppError(400, 'VALIDATION_ERROR', 'Content value must be a valid email.')
      return value.toLowerCase()
    }

    case SiteContentType.PHONE:
      if (!/^[+()\d\s.-]{8,30}$/.test(value)) {
        throw new AppError(400, 'VALIDATION_ERROR', 'Content value must be a valid phone number.')
      }
      return value

    case SiteContentType.JSON:
      try {
        JSON.parse(value)
      } catch {
        throw new AppError(400, 'VALIDATION_ERROR', 'Content value must be valid JSON.')
      }
      return value

    case SiteContentType.TEXT:
    default:
      return value
  }
}

function validateMetadata(metadata: unknown): unknown {
  if (metadata == null) return null
  if (!isPlainJsonObject(metadata)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Metadata must be a JSON object.')
  }
  return metadata
}

async function findByKey(key: string) {
  const content = await prisma.siteContent.findUnique({
    where: { key },
    include: { updatedBy: { select: { id: true, name: true, email: true } } },
  })
  if (!content) throw new AppError(404, 'NOT_FOUND', `Site content "${key}" not found.`)
  return content
}

function impactedScopes(items: Array<{ key: string; group: string | null }>): string[] {
  return [...new Set(items.flatMap((item) => [item.key, item.group].filter(Boolean) as string[]))]
}

async function updateExistingContent(
  existing: SiteContentRecord,
  data: UpdateSiteContentInput,
  actorId: string
) {
  const value = validateValueForType(existing.type, data.value)
  const metadata =
    data.metadata === undefined
      ? undefined
      : data.metadata === null
        ? Prisma.JsonNull
        : (validateMetadata(data.metadata) as Prisma.InputJsonValue)

  const updated = await prisma.siteContent.update({
    where: { key: existing.key },
    data: {
      value,
      label: data.label === undefined ? undefined : data.label,
      description: data.description === undefined ? undefined : data.description,
      metadata,
      updatedById: actorId,
    },
    include: { updatedBy: { select: { id: true, name: true, email: true } } },
  })

  await audit({
    actorId,
    action: 'site-content.update',
    entity: 'SiteContent',
    entityId: existing.id,
    before: existing,
    after: updated,
  })

  return updated
}

export async function listAdminSiteContent(filters: SiteContentAdminFilters) {
  return prisma.siteContent.findMany({
    where: {
      ...(filters.group ? { group: filters.group } : {}),
      ...(filters.type ? { type: filters.type } : {}),
    },
    include: { updatedBy: { select: { id: true, name: true, email: true } } },
    orderBy: [{ group: 'asc' }, { key: 'asc' }],
  })
}

export async function getAdminSiteContent(key: string) {
  return findByKey(key)
}

export async function updateSiteContent(
  key: string,
  data: UpdateSiteContentInput,
  actorId: string
) {
  const existing = await findByKey(key)
  const updated = await updateExistingContent(existing, data, actorId)
  await revalidateSiteContent(impactedScopes([updated]))
  return updated
}

export async function uploadSiteContentImage(
  key: string,
  file: Express.Multer.File | undefined,
  body: UploadMediaBody,
  actorId: string
) {
  if (!file) throw new AppError(400, 'VALIDATION_ERROR', 'No image provided.')

  const existing = await findByKey(key)
  if (existing.type !== SiteContentType.IMAGE) {
    throw new AppError(409, 'CONFLICT', `Site content "${key}" is not an image field.`)
  }

  const [asset] = await uploadMediaAssets(
    [file],
    {
      ...body,
      folder: body.folder === 'media' ? `site-content/${key}` : body.folder,
    },
    actorId
  )

  const updated = await updateExistingContent(
    existing,
    {
      value: asset.url,
      metadata: {
        mediaAssetId: asset.id,
        publicId: asset.publicId,
        width: asset.width,
        height: asset.height,
      },
    },
    actorId
  )

  await revalidateSiteContent(impactedScopes([updated]))
  return { content: updated, asset }
}

export async function bulkUpdateSiteContent(input: BulkUpdateSiteContentInput, actorId: string) {
  const keys = input.items.map((item) => item.key)
  const uniqueKeys = [...new Set(keys)]

  if (uniqueKeys.length !== keys.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Content keys must be unique.')
  }

  const existingItems = await prisma.siteContent.findMany({
    where: { key: { in: uniqueKeys } },
    include: { updatedBy: { select: { id: true, name: true, email: true } } },
  })
  const existingByKey = new Map(existingItems.map((item) => [item.key, item]))

  if (existingByKey.size !== uniqueKeys.length) {
    const missing = uniqueKeys.filter((key) => !existingByKey.has(key))
    throw new AppError(404, 'NOT_FOUND', `Site content keys not found: ${missing.join(', ')}.`)
  }

  const updated = []

  for (const item of input.items) {
    const existing = existingByKey.get(item.key)!
    updated.push(await updateExistingContent(existing, item, actorId))
  }

  await revalidateSiteContent(impactedScopes(updated))
  return updated
}

export async function listPublicSiteContent(filters: SiteContentPublicFilters) {
  const items = await prisma.siteContent.findMany({
    where: {
      ...(filters.group ? { group: filters.group } : {}),
      ...(filters.keys ? { key: { in: filters.keys } } : {}),
    },
    select: PUBLIC_SELECT,
    orderBy: [{ group: 'asc' }, { key: 'asc' }],
  })

  return items.map((item) => ({
    ...item,
    parsedValue: item.type === SiteContentType.JSON ? JSON.parse(item.value) : undefined,
  }))
}
