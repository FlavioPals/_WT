import { Request, Response } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import type { ContactInput } from './contact.schemas'
import * as contactService from './contact.service'

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

export const submitContact = asyncHandler(async (req: Request, res: Response) => {
  const result = await contactService.submitContact(req.body as ContactInput, {
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get('user-agent') ?? null,
  })

  res.status(202).json({ data: result, meta: meta(req) })
})
