import { z } from 'zod'

const slugField = z
  .string()
  .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers and hyphens.')
  .optional()

const nullableUrl = z.string().url().optional().nullable()

const booleanParam = z.preprocess(
  (v) => (v === 'true' ? true : v === 'false' ? false : v),
  z.boolean().optional()
)

export const createTeamMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(120),
  slug: slugField,
  role: z.string().min(2, 'Role must be at least 2 characters.').max(120),
  bio: z.string().min(1, 'Bio is required.').max(5000),
  photoUrl: z.string().min(1, 'URL da foto é obrigatória.').optional(),
  photoPublicId: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  instagramUrl: nullableUrl,
  linkedinUrl: nullableUrl,
  active: z.boolean().default(true),
  order: z.number().int().min(0).default(0),
})

export const updateTeamMemberSchema = createTeamMemberSchema.partial()

export const teamAdminFiltersSchema = z.object({
  active: booleanParam,
  deleted: z.preprocess((v) => v === 'true', z.boolean()).default(false),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  sort: z.enum(['order', 'name', 'createdAt']).default('order'),
  direction: z.enum(['asc', 'desc']).default('asc'),
})

export const teamPublicFiltersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.enum(['order', 'name']).default('order'),
  direction: z.enum(['asc', 'desc']).default('asc'),
})

export const reorderTeamSchema = z.object({
  ids: z.array(z.string()).min(1, 'At least one id is required.'),
})

export type CreateTeamMemberInput = z.infer<typeof createTeamMemberSchema>
export type UpdateTeamMemberInput = z.infer<typeof updateTeamMemberSchema>
export type TeamAdminFilters = z.infer<typeof teamAdminFiltersSchema>
export type TeamPublicFilters = z.infer<typeof teamPublicFiltersSchema>
export type ReorderTeamInput = z.infer<typeof reorderTeamSchema>
