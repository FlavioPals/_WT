import 'dotenv/config'
import { spawnSync } from 'child_process'
import { existsSync } from 'fs'
import path from 'path'

function validateMigrateEnv(): void {
  if (process.env.DATABASE_URL) return

  console.error('\n[deploy] DATABASE_URL is required to run Prisma migrations.')
  console.error('[deploy] Configure DATABASE_URL in Render before running this command.\n')
  process.exit(1)
}

export function runDeployMigrations(): void {
  validateMigrateEnv()

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

if (require.main === module) {
  runDeployMigrations()
}
