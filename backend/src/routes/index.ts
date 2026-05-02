import { Request, Response, Router } from 'express'

export const router = Router()

router.get('/health', (_req: Request, res: Response) => {
  res.json({
    data: {
      status: 'ok',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV ?? 'development',
    },
    meta: { timestamp: new Date().toISOString() },
  })
})
