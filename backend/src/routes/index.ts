import { Request, Response, Router } from 'express'
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

router.use('/auth', authRouter)
router.use('/admin', adminRouter)
router.use('/public', publicRouter)
