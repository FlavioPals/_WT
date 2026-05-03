import type { Express } from 'express'
import { ProjectImageType, ProjectStatus } from '../../generated/prisma/client'
import { audit } from '../../lib/audit'
import { revalidateProject } from '../../lib/revalidate'
import {
  deleteFromStorage,
  getImageDimensions,
  uploadToCloudinary,
  validateImageDimensions,
  validateMagicBytes,
  validateUploadFileSize,
} from '../../lib/upload'
import { AppError } from '../../middlewares/error.middleware'
import { prisma } from '../../lib/prisma'
import { env } from '../../config/env'
import type {
  ListImagesQuery,
  ReorderImagesInput,
  SetCoverInput,
  UpdateImageInput,
  UploadImagesBody,
} from './project-images.schemas'

async function findProjectOrFail(projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, deletedAt: null },
    select: { id: true, slug: true, title: true, status: true },
  })
  if (!project) throw new AppError(404, 'NOT_FOUND', 'Project not found.')
  return project
}

async function findImageOrFail(imageId: string) {
  const image = await prisma.projectImage.findFirst({
    where: { id: imageId, deletedAt: null },
    include: { project: { select: { id: true, slug: true, status: true, coverImage: true } } },
  })
  if (!image) throw new AppError(404, 'NOT_FOUND', 'Image not found.')
  return image
}

async function findImageIncludingDeletedOrFail(imageId: string) {
  const image = await prisma.projectImage.findFirst({
    where: { id: imageId },
    include: { project: { select: { id: true, slug: true, status: true, coverImage: true } } },
  })
  if (!image) throw new AppError(404, 'NOT_FOUND', 'Image not found.')
  return image
}

async function revalidatePublishedProject(project: { slug: string; status: ProjectStatus }) {
  if (project.status === ProjectStatus.PUBLISHED) {
    await revalidateProject(project.slug)
  }
}

export async function listProjectImages(projectId: string, query: ListImagesQuery) {
  await findProjectOrFail(projectId)
  return prisma.projectImage.findMany({
    where: {
      projectId,
      deletedAt: null,
      ...(query.type ? { type: query.type } : {}),
    },
    orderBy: { order: 'asc' },
  })
}

export async function uploadImages(
  projectId: string,
  files: Express.Multer.File[],
  body: UploadImagesBody,
  actorId: string
) {
  if (!files || files.length === 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'No files provided.')
  }

  const project = await findProjectOrFail(projectId)
  const folder = `${env.CLOUDINARY_FOLDER}/projects/${projectId}/${body.type.toLowerCase()}`

  const created = await Promise.all(
    files.map(async (file, index) => {
      validateUploadFileSize(file.size)
      await validateMagicBytes(file.buffer)
      const dimensions = await getImageDimensions(file.buffer)
      validateImageDimensions(dimensions)

      const result = await uploadToCloudinary(file.buffer, {
        folder,
        resource_type: 'image',
      })

      const altFallback = body.alt ?? `${project.title} - imagem ${index + 1}`
      const existing = await prisma.projectImage.count({ where: { projectId, deletedAt: null } })

      return prisma.projectImage.create({
        data: {
          projectId,
          url: result.secure_url,
          publicId: result.public_id,
          type: body.type,
          alt: altFallback,
          caption: body.caption ?? null,
          width: dimensions.width,
          height: dimensions.height,
          format: dimensions.format,
          bytes: result.bytes,
          order: existing + index,
          createdById: actorId,
        },
      })
    })
  )

  if (body.type === ProjectImageType.COVER && created[0]) {
    await prisma.project.update({
      where: { id: projectId },
      data: { coverImage: created[0].url, updatedById: actorId },
    })
  }

  await audit({
    actorId,
    action: 'project-image.upload',
    entity: 'ProjectImage',
    entityId: projectId,
    after: { count: created.length, type: body.type },
  })

  await revalidatePublishedProject(project)

  return created
}

export async function getImage(imageId: string) {
  return findImageOrFail(imageId)
}

export async function updateImage(imageId: string, data: UpdateImageInput, actorId: string) {
  const existing = await findImageOrFail(imageId)

  const updated = await prisma.projectImage.update({
    where: { id: imageId },
    data,
  })

  await audit({
    actorId,
    action: 'project-image.update',
    entity: 'ProjectImage',
    entityId: imageId,
    before: existing,
    after: updated,
  })

  await revalidatePublishedProject(existing.project)

  return updated
}

export async function reorderImages(projectId: string, input: ReorderImagesInput, actorId: string) {
  const project = await findProjectOrFail(projectId)
  const uniqueIds = [...new Set(input.ids)]

  if (uniqueIds.length !== input.ids.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Image ids must be unique.')
  }

  const images = await prisma.projectImage.findMany({
    where: { id: { in: uniqueIds }, projectId, deletedAt: null },
    select: { id: true },
  })

  if (images.length !== uniqueIds.length) {
    throw new AppError(400, 'VALIDATION_ERROR', 'All image ids must belong to this project.')
  }

  await prisma.$transaction(
    uniqueIds.map((id, index) =>
      prisma.projectImage.update({ where: { id }, data: { order: index } })
    )
  )

  await audit({
    actorId,
    action: 'project-image.reorder',
    entity: 'ProjectImage',
    entityId: projectId,
    after: { ids: uniqueIds },
  })

  await revalidatePublishedProject(project)
}

export async function softDeleteImage(imageId: string, actorId: string) {
  const existing = await findImageOrFail(imageId)

  await prisma.$transaction([
    prisma.projectImage.update({ where: { id: imageId }, data: { deletedAt: new Date() } }),
    ...(existing.project.coverImage === existing.url
      ? [
          prisma.project.update({
            where: { id: existing.projectId },
            data: { coverImage: null, updatedById: actorId },
          }),
        ]
      : []),
  ])

  await audit({
    actorId,
    action: 'project-image.delete',
    entity: 'ProjectImage',
    entityId: imageId,
    before: existing,
  })

  await revalidatePublishedProject(existing.project)
}

export async function hardDeleteImage(imageId: string, actorId: string) {
  const existing = await findImageIncludingDeletedOrFail(imageId)

  await deleteFromStorage(existing.publicId)

  await prisma.$transaction([
    prisma.projectImage.delete({ where: { id: imageId } }),
    ...(existing.project.coverImage === existing.url
      ? [
          prisma.project.update({
            where: { id: existing.projectId },
            data: { coverImage: null, updatedById: actorId },
          }),
        ]
      : []),
  ])

  await audit({
    actorId,
    action: 'project-image.hard-delete',
    entity: 'ProjectImage',
    entityId: imageId,
    before: existing,
  })

  await revalidatePublishedProject(existing.project)
}

export async function setCoverImage(projectId: string, input: SetCoverInput, actorId: string) {
  const project = await findProjectOrFail(projectId)
  const image = await prisma.projectImage.findFirst({
    where: { id: input.imageId, projectId, deletedAt: null },
  })
  if (!image) throw new AppError(404, 'NOT_FOUND', 'Image not found in this project.')

  const updated = await prisma.project.update({
    where: { id: projectId },
    data: { coverImage: image.url, updatedById: actorId },
    select: { id: true, coverImage: true, slug: true, status: true },
  })

  await audit({
    actorId,
    action: 'project.set-cover',
    entity: 'Project',
    entityId: projectId,
    after: { coverImage: image.url },
  })

  if (updated.status === 'PUBLISHED') {
    await revalidateProject(project.slug)
  }

  return updated
}
