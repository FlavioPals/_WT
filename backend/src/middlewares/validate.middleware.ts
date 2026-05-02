import { NextFunction, Request, Response } from 'express'
import { z } from 'zod'

type RequestPart = 'body' | 'query' | 'params'

export function validate<T extends z.ZodTypeAny>(schema: T, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part])
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }))
      res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input.', details },
        meta: { requestId: req.requestId, timestamp: new Date().toISOString() },
      })
      return
    }
    const target = req as unknown as Record<RequestPart, unknown>
    target[part] = result.data
    next()
  }
}
