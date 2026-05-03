import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email.'),
  password: z.string().min(1, 'Password is required.'),
})

export const changeOwnPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.').max(128),
    confirmPassword: z.string().min(1, 'Password confirmation is required.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password confirmation does not match.',
  })

export type LoginInput = z.infer<typeof loginSchema>
export type ChangeOwnPasswordInput = z.infer<typeof changeOwnPasswordSchema>
