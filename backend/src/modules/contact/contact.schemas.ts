import { z } from 'zod'

const optionalPhone = z.preprocess(
  (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
  z
    .string()
    .trim()
    .min(8, 'Phone must be at least 8 characters.')
    .max(30, 'Phone must be at most 30 characters.')
    .regex(/^[0-9()+\-\s.]+$/, 'Phone contains invalid characters.')
    .optional()
)

export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
  email: z.string().trim().email('Email must be valid.').max(254).toLowerCase(),
  phone: optionalPhone,
  message: z.string().trim().min(10, 'Message must be at least 10 characters.').max(3000),
  website: z.string().trim().max(200).optional().default(''),
})

export type ContactInput = z.infer<typeof contactSchema>
