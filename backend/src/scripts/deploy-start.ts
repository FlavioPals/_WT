import 'dotenv/config'
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

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

function runMigrations(): void {
  console.log('[deploy] Running Prisma migrations...')
  const prismaBin = path.resolve(process.cwd(), 'node_modules', 'prisma', 'build', 'index.js')

  if (!existsSync(prismaBin)) {
    console.error(`[deploy] Prisma CLI not found at ${prismaBin}.`)
    console.error(
      '[deploy] Make sure the "prisma" package is installed as a production dependency.'
    )
    process.exit(1)
  }

  console.log(`[deploy] Using Prisma CLI at ${prismaBin}`)

  const result = spawnSync(process.execPath, [prismaBin, 'migrate', 'deploy'], {
    encoding: 'utf8',
    env: process.env,
  })

  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)

  if (result.error) {
    console.error('[deploy] Failed to start Prisma migrate deploy:', result.error)
    process.exit(1)
  }

  if (result.status !== 0) {
    console.error(
      `[deploy] Prisma migrate deploy failed with status ${result.status ?? 'unknown'}.`
    )
    process.exit(result.status ?? 1)
  }
}

async function startServer(): Promise<void> {
  console.log('[deploy] Starting API server...')
  await import('../server')
}

validateDeployEnv()
runMigrations()
void startServer()
