import { Router } from 'express'
import { csrf } from '../../middlewares/csrf.middleware'
import { requireRole } from '../../middlewares/require-role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import * as usersController from './users.controller'
import {
  createUserSchema,
  resetPasswordSchema,
  updateUserSchema,
  usersAdminFiltersSchema,
} from './users.schemas'

export const usersAdminRouter = Router()

usersAdminRouter.use(requireRole('ADMIN'))

usersAdminRouter.get('/', validate(usersAdminFiltersSchema, 'query'), usersController.listUsers)
usersAdminRouter.post('/', csrf, validate(createUserSchema), usersController.createUser)
usersAdminRouter.get('/:id', usersController.getUser)
usersAdminRouter.patch('/:id', csrf, validate(updateUserSchema), usersController.updateUser)
usersAdminRouter.delete('/:id', csrf, usersController.deleteUser)
usersAdminRouter.post(
  '/:id/reset-password',
  csrf,
  validate(resetPasswordSchema),
  usersController.resetPassword
)
usersAdminRouter.post('/:id/revoke-sessions', csrf, usersController.revokeSessions)
