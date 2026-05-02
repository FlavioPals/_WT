import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown[]
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const meta = { requestId: req.requestId, timestamp: new Date().toISOString() }
  const maybeMulterError = err as Error & { code?: string; field?: string }

  if (err.name === 'MulterError') {
    const isTooLarge =
      maybeMulterError.code === 'LIMIT_FILE_SIZE' || maybeMulterError.code === 'LIMIT_FILE_COUNT'

    res.status(isTooLarge ? 413 : 400).json({
      error: {
        code: isTooLarge ? 'UPLOAD_TOO_LARGE' : 'UPLOAD_ERROR',
        message: isTooLarge ? 'Uploaded file exceeds the configured limits.' : err.message,
        ...(maybeMulterError.field
          ? { details: [{ path: maybeMulterError.field, message: err.message }] }
          : {}),
      },
      meta,
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data.',
        details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
      },
      meta,
    })
    return
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
      meta,
    })
    return
  }

  console.error(err)

  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' },
    meta,
  })
}
