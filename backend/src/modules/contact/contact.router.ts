import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { env } from '../../config/env'
import { validate } from '../../middlewares/validate.middleware'
import * as contactController from './contact.controller'
import { contactSchema } from './contact.schemas'

const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: env.CONTACT_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Too many contact attempts, try again later.' },
  },
})

export const contactRouter = Router()

contactRouter.post('/', contactRateLimit, validate(contactSchema), contactController.submitContact)
