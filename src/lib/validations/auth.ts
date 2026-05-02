import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email('Informe um e-mail válido.'),
  password: z.string().min(2, 'A senha deve ter pelo menos 2 caracteres.').max(72),
})
