import 'dotenv/config'
import { createApp } from './app'
import { env } from './config/env'
import { logger } from './lib/logger'

const app = createApp()

app.listen(env.PORT, () => {
  logger.info({ port: env.PORT }, 'Server running')
  logger.info(`Health: ${env.API_URL}/api/v1/health`)
})
