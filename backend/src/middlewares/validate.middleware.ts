import { NextFunction, Request, Response } from 'express'
import { ZodSchema } from 'zod'

export function validate<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
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
    req.body = result.data
    next()
  }
}
