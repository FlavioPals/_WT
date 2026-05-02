import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),

  API_URL: z.string().url().default('http://localhost:4000'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),

  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  COOKIE_SECRET: z.string().min(32, 'COOKIE_SECRET must be at least 32 chars'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 chars'),

  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  CLOUDINARY_FOLDER: z.string().default('arquitetos-portfolio'),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  CONTACT_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(5),
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().int().positive().default(8),

  RESEND_API_KEY: z.preprocess((v) => (v === '' ? undefined : v), z.string().min(1).optional()),
  CONTACT_FROM_EMAIL: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.string().email().optional()
  ),
  CONTACT_TO_EMAIL: z.preprocess((v) => (v === '' ? undefined : v), z.string().email().optional()),
  CONTACT_SUBJECT_PREFIX: z.string().default('[Studio WT] Novo contato'),
})

function parseEnv() {
  const result = envSchema.safeParse(process.env)
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  • ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    console.error(`\n[env] Missing or invalid environment variables:\n${issues}\n`)
    process.exit(1)
  }
  return result.data
}

export const env = parseEnv()
export type Env = z.infer<typeof envSchema>
