import { z } from 'zod'

const folderSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(
    /^[a-z0-9/_-]+$/,
    'Folder must use lowercase letters, numbers, slashes, underscores or hyphens.'
  )

export const uploadMediaBodySchema = z.object({
  folder: folderSchema.default('media'),
  alt: z.string().max(200).optional(),
  caption: z.string().max(400).optional(),
})

export const mediaAdminFiltersSchema = z.object({
  folder: folderSchema.optional(),
  deleted: z.preprocess((v) => v === 'true', z.boolean()).default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  sort: z.enum(['createdAt', 'bytes']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
})

export const updateMediaAssetSchema = z.object({
  alt: z.string().max(200).optional().nullable(),
  caption: z.string().max(400).optional().nullable(),
})

export type UploadMediaBody = z.infer<typeof uploadMediaBodySchema>
export type MediaAdminFilters = z.infer<typeof mediaAdminFiltersSchema>
export type UpdateMediaAssetInput = z.infer<typeof updateMediaAssetSchema>
