import { NextFunction, Request, Response } from 'express'
import { Role } from '../generated/prisma/client'

export function requireRole(...roles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' },
        meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
      })
      return
    }

    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({
        error: { code: 'FORBIDDEN', message: 'Insufficient permissions.' },
        meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
      })
      return
    }

    next()
  }
}
