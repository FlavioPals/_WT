import 'dotenv/config'

const REQUIRED_ENV = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'COOKIE_SECRET',
  'CSRF_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const

const MIN_SECRET_LENGTH = 32
const SECRET_ENV = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'COOKIE_SECRET', 'CSRF_SECRET']

function validateDeployEnv(): void {
  const issues: string[] = []

  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) issues.push(`${key} is required`)
  }

  for (const key of SECRET_ENV) {
    const value = process.env[key]
    if (value && value.length < MIN_SECRET_LENGTH) {
      issues.push(`${key} must be at least ${MIN_SECRET_LENGTH} characters`)
    }
  }

  if (issues.length > 0) {
    console.error('\n[deploy] Missing or invalid environment variables:')
    for (const issue of issues) console.error(`  - ${issue}`)
    console.error('\n[deploy] Configure these variables in Render before starting the backend.\n')
    process.exit(1)
  }
}

async function maybeRunMigrations(): Promise<void> {
  if (process.env.RUN_MIGRATIONS_ON_START !== 'true') {
    console.log('[deploy] Skipping Prisma migrations on start.')
    console.log(
      '[deploy] Run "npm run deploy:migrate" from Render Shell, or set RUN_MIGRATIONS_ON_START=true when DATABASE_URL is direct and reachable.'
    )
    return
  }

  const { runDeployMigrations } = await import('./deploy-migrate')
  runDeployMigrations()
}

async function startServer(): Promise<void> {
  console.log('[deploy] Starting API server...')
  await import('../server')
}

async function main(): Promise<void> {
  validateDeployEnv()
  await maybeRunMigrations()
  await startServer()
}

void main().catch((error) => {
  console.error('[deploy] Failed to start API server:', error)
  process.exit(1)
})
