import { createApp } from './app'
import { logger } from './lib/logger'

const PORT = parseInt(process.env.PORT ?? '4000', 10)

const app = createApp()

app.listen(PORT, () => {
  logger.info({ port: PORT }, 'Server running')
  logger.info(`Health: http://localhost:${PORT}/api/v1/health`)
})
