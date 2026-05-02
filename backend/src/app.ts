import cookieParser from 'cookie-parser'
import cors from 'cors'
import express, { Application } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import swaggerUi from 'swagger-ui-express'
import { env } from './config/env'
import { swaggerSpec } from './config/swagger'
import { logger } from './lib/logger'
import { errorMiddleware } from './middlewares/error.middleware'
import { notFoundMiddleware } from './middlewares/not-found.middleware'
import { requestIdMiddleware } from './middlewares/request-id.middleware'
import { router } from './routes/index'

const globalRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
  },
})

export function createApp(): Application {
  const app = express()

  app.use(requestIdMiddleware)
  app.use(
    pinoHttp({
      logger,
      customProps: (req) => ({ requestId: (req as Express.Request).requestId }),
    })
  )
  app.use(helmet())
  app.use(
    cors({
      origin: env.FRONTEND_URL,
      credentials: true,
    })
  )
  app.use(cookieParser(env.COOKIE_SECRET))
  app.use(express.json({ limit: '1mb' }))
  app.use(express.urlencoded({ extended: true }))
  app.use(globalRateLimit)

  app.use('/api/v1', router)

  if (env.NODE_ENV !== 'production') {
    app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
    logger.info(`Docs: ${env.API_URL}/api/v1/docs`)
  }

  app.use(notFoundMiddleware)
  app.use(errorMiddleware)

  return app
}
