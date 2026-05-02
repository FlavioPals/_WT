import { z } from 'zod'
import { Role } from '../../generated/prisma/client'

const booleanParam = z.preprocess(
  (v) => (v === 'true' ? true : v === 'false' ? false : v),
  z.boolean().optional()
)

const deletedParam = z.preprocess((v) => v === 'true', z.boolean()).default(false)

export const temporaryPasswordSchema = z
  .string()
  .min(12, 'Temporary password must be at least 12 characters.')
  .max(128, 'Temporary password must be at most 128 characters.')
  .regex(/[a-z]/, 'Temporary password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Temporary password must include an uppercase letter.')
  .regex(/[0-9]/, 'Temporary password must include a number.')
  .regex(/[^A-Za-z0-9]/, 'Temporary password must include a symbol.')

export const createUserSchema = z.object({
  email: z.string().trim().email('Email must be valid.').toLowerCase(),
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
  role: z.nativeEnum(Role).default(Role.ARCHITECT),
  active: z.boolean().default(true),
  temporaryPassword: temporaryPasswordSchema.optional(),
})

export const updateUserSchema = z
  .object({
    email: z.string().trim().email('Email must be valid.').toLowerCase().optional(),
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120).optional(),
    role: z.nativeEnum(Role).optional(),
    active: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided.',
  })

export const resetPasswordSchema = z.object({
  temporaryPassword: temporaryPasswordSchema.optional(),
})

export const usersAdminFiltersSchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  role: z.nativeEnum(Role).optional(),
  active: booleanParam,
  deleted: deletedParam,
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.enum(['name', 'email', 'role', 'createdAt', 'lastLoginAt']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc'),
})

export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UsersAdminFilters = z.infer<typeof usersAdminFiltersSchema>
