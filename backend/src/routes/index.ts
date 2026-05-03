import { Request, Response, Router } from 'express'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { authRouter } from '../modules/auth/auth.router'
import { adminRouter } from './admin.routes'
import { publicRouter } from './public.routes'

export const router = Router()

router.get('/health', (req: Request, res: Response) => {
  res.json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
    },
    meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
  })
})

router.get('/ready', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({
      data: { status: 'ready', database: 'ok' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    })
  } catch (err) {
    logger.error({ err, requestId: req.requestId }, 'Readiness check failed')
    res.status(503).json({
      error: { code: 'NOT_READY', message: 'Service is not ready to accept traffic.' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    })
  }
})

router.use('/auth', authRouter)
router.use('/admin', adminRouter)
router.use('/public', publicRouter)
