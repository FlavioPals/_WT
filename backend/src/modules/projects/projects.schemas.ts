import { z } from 'zod'
import { ProjectStatus } from '../../generated/prisma/client'

const CURRENT_YEAR = new Date().getFullYear()

const slugField = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens.')
  .optional()

export const createProjectSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters.').max(160),
  slug: slugField,
  description: z.string().min(1, 'Description is required.'),
  concept: z.string().optional().nullable(),
  year: z
    .number()
    .int()
    .min(1900)
    .max(CURRENT_YEAR + 5)
    .optional()
    .nullable(),
  location: z.string().optional().nullable(),
  area: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable(),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
  seoTitle: z.string().max(160).optional().nullable(),
  seoDescription: z.string().max(300).optional().nullable(),
})

export const updateProjectSchema = createProjectSchema.partial()

const booleanParam = z.preprocess(
  (v) => (v === 'true' ? true : v === 'false' ? false : v),
  z.boolean().optional()
)

export const projectAdminFiltersSchema = z.object({
  category: z.string().optional(),
  featured: booleanParam,
  status: z.nativeEnum(ProjectStatus).optional(),
  deleted: z.preprocess((v) => v === 'true', z.boolean()).default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['order', 'year', 'createdAt']).default('order'),
  direction: z.enum(['asc', 'desc']).default('asc'),
})

export const projectPublicFiltersSchema = z.object({
  category: z.string().optional(),
  featured: booleanParam,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['order', 'year', 'createdAt']).default('order'),
  direction: z.enum(['asc', 'desc']).default('asc'),
})

export const reorderProjectsSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one id is required.'),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectAdminFilters = z.infer<typeof projectAdminFiltersSchema>
export type ProjectPublicFilters = z.infer<typeof projectPublicFiltersSchema>
export type ReorderProjectsInput = z.infer<typeof reorderProjectsSchema>
