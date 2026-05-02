import { NextFunction, Request, Response } from 'express'
import { verifyAccessToken } from '../modules/auth/auth.service'

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header.' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    })
    return
  }

  try {
    const payload = await verifyAccessToken(authHeader.slice(7))
    req.user = { id: payload.sub, email: payload.email, name: payload.name, role: payload.role }
    next()
  } catch {
    res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token.' },
      meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
    })
  }
}
