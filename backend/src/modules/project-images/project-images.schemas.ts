import { z } from 'zod'
import { ProjectImageType } from '../../generated/prisma/client'

export const uploadImagesBodySchema = z.object({
  type: z.nativeEnum(ProjectImageType).default(ProjectImageType.GALLERY),
  alt: z.string().max(200).optional(),
  caption: z.string().max(400).optional(),
})

export const listImagesQuerySchema = z.object({
  type: z.nativeEnum(ProjectImageType).optional(),
})

export const updateImageSchema = z.object({
  alt: z.string().max(200).optional().nullable(),
  caption: z.string().max(400).optional().nullable(),
  type: z.nativeEnum(ProjectImageType).optional(),
  order: z.number().int().min(0).optional(),
})

export const reorderImagesSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one id is required.'),
})

export const setCoverSchema = z.object({
  imageId: z.string().min(1, 'imageId is required.'),
})

export type UploadImagesBody = z.infer<typeof uploadImagesBodySchema>
export type ListImagesQuery = z.infer<typeof listImagesQuerySchema>
export type UpdateImageInput = z.infer<typeof updateImageSchema>
export type ReorderImagesInput = z.infer<typeof reorderImagesSchema>
export type SetCoverInput = z.infer<typeof setCoverSchema>
