import { z } from 'zod'
import { SiteContentType } from '../../generated/prisma/client'

const contentKeySchema = z
  .string()
  .min(2)
  .max(100)
  .regex(
    /^[a-z0-9_:-]+$/,
    'Key must use lowercase letters, numbers, underscores, colons or hyphens.'
  )

export const siteContentAdminFiltersSchema = z.object({
  group: z.string().min(1).max(80).optional(),
  type: z.nativeEnum(SiteContentType).optional(),
})

export const siteContentPublicFiltersSchema = z.object({
  group: z.string().min(1).max(80).optional(),
  keys: z
    .string()
    .optional()
    .transform((value) =>
      value
        ? value
            .split(',')
            .map((key) => key.trim())
            .filter(Boolean)
        : undefined
    ),
})

export const updateSiteContentSchema = z.object({
  value: z.string().max(50_000),
  label: z.string().max(160).optional().nullable(),
  description: z.string().max(500).optional().nullable(),
  metadata: z.unknown().optional().nullable(),
})

export const bulkUpdateSiteContentSchema = z.object({
  items: z
    .array(
      z.object({
        key: contentKeySchema,
        value: z.string().max(50_000),
        label: z.string().max(160).optional().nullable(),
        description: z.string().max(500).optional().nullable(),
        metadata: z.unknown().optional().nullable(),
      })
    )
    .min(1, 'At least one content item is required.')
    .max(100, 'Bulk update is limited to 100 items.'),
})

export type SiteContentAdminFilters = z.infer<typeof siteContentAdminFiltersSchema>
export type SiteContentPublicFilters = z.infer<typeof siteContentPublicFiltersSchema>
export type UpdateSiteContentInput = z.infer<typeof updateSiteContentSchema>
export type BulkUpdateSiteContentInput = z.infer<typeof bulkUpdateSiteContentSchema>
