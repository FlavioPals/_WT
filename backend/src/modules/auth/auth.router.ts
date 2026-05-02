import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authenticate } from '../../middlewares/authenticate.middleware'
import { validate } from '../../middlewares/validate.middleware'
import * as authController from './auth.controller'
import { loginSchema } from './auth.schemas'

const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: { code: 'RATE_LIMITED', message: 'Too many auth attempts, try again later.' },
  },
})

export const authRouter = Router()

authRouter.post('/login', authRateLimit, validate(loginSchema), authController.login)
authRouter.post('/refresh', authController.refresh)
authRouter.post('/logout', authController.logout)
authRouter.post('/logout-all', authenticate, authController.logoutAll)
authRouter.get('/me', authenticate, authController.me)
