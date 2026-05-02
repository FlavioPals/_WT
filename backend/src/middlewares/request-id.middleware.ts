import { NextFunction, Request, Response } from 'express'

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const id = crypto.randomUUID()
  req.requestId = id
  res.setHeader('X-Request-Id', id)
  next()
}
