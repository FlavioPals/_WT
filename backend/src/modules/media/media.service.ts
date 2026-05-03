import type { Express } from 'express'
import { env } from '../../config/env'
import { audit } from '../../lib/audit'
import { paginationMeta, paginationSkip, type PaginatedResult } from '../../lib/pagination'
import { prisma } from '../../lib/prisma'
import {
  deleteFromStorage,
  getImageDimensions,
  uploadToCloudinary,
  validateImageDimensions,
  validateMagicBytes,
  validateUploadFileSize,
} from '../../lib/upload'
import { AppError } from '../../middlewares/error.middleware'
import type { MediaAdminFilters, UpdateMediaAssetInput, UploadMediaBody } from './media.schemas'

async function findAssetOrFail(id: string, includeDeleted = false) {
  const asset = await prisma.mediaAsset.findFirst({
    where: { id, ...(includeDeleted ? {} : { deletedAt: null }) },
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })
  if (!asset) throw new AppError(404, 'NOT_FOUND', 'Media asset not found.')
  return asset
}

function cloudinaryFolder(folder: string): string {
  return `${env.CLOUDINARY_FOLDER}/${folder}`.replace(/\/+/g, '/')
}

export async function uploadMediaAssets(
  files: Express.Multer.File[],
  body: UploadMediaBody,
  actorId: string
) {
  if (!files || files.length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No files provided.')
  }

  const created = await Promise.all(
    files.map(async (file, index) => {
      validateUploadFileSize(file.size)
      await validateMagicBytes(file.buffer)
      const dimensions = await getImageDimensions(file.buffer)
      validateImageDimensions(dimensions)

      const result = await uploadToCloudinary(file.buffer, {
        folder: cloudinaryFolder(body.folder),
        resource_type: 'image',
      })

      return prisma.mediaAsset.create({
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          folder: body.folder,
          alt: body.alt ?? file.originalname ?? `Media asset ${index + 1}`,
          caption: body.caption ?? null,
          mimeType: file.mimetype,
          width: dimensions.width,
          height: dimensions.height,
          bytes: result.bytes,
          createdById: actorId,
        },
        include: { createdBy: { select: { id: true, name: true, email: true } } },
      })
    })
  )

  await audit({
    actorId,
    action: 'media.upload',
    entity: 'MediaAsset',
    after: { count: created.length, ids: created.map((asset) => asset.id), folder: body.folder },
  })

  return created
}

export async function listMediaAssets(
  filters: MediaAdminFilters
): Promise<PaginatedResult<unknown>> {
  const { page, limit, sort, direction, folder, deleted } = filters
  const where = {
    deletedAt: deleted ? { not: null } : null,
    ...(folder ? { folder } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true, email: true } } },
      orderBy: { [sort]: direction },
      skip: paginationSkip(page, limit),
      take: limit,
    }),
    prisma.mediaAsset.count({ where }),
  ])

  return { items, pagination: paginationMeta(total, page, limit) }
}

export async function getMediaAsset(id: string) {
  return findAssetOrFail(id)
}

export async function updateMediaAsset(id: string, data: UpdateMediaAssetInput, actorId: string) {
  const existing = await findAssetOrFail(id)

  const updated = await prisma.mediaAsset.update({
    where: { id },
    data,
    include: { createdBy: { select: { id: true, name: true, email: true } } },
  })

  await audit({
    actorId,
    action: 'media.update',
    entity: 'MediaAsset',
    entityId: id,
    before: existing,
    after: updated,
  })

  return updated
}

export async function softDeleteMediaAsset(id: string, actorId: string) {
  const existing = await findAssetOrFail(id)

  await prisma.mediaAsset.update({
    where: { id },
    data: { deletedAt: new Date() },
  })

  await audit({
    actorId,
    action: 'media.delete',
    entity: 'MediaAsset',
    entityId: id,
    before: existing,
  })
}

export async function hardDeleteMediaAsset(id: string, actorId: string) {
  const existing = await findAssetOrFail(id, true)

  await deleteFromStorage(existing.publicId)
  await prisma.mediaAsset.delete({ where: { id } })

  await audit({
    actorId,
    action: 'media.hard-delete',
    entity: 'MediaAsset',
    entityId: id,
    before: existing,
  })
}
