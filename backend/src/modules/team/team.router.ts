import { Router } from 'express'
import { uploadMiddleware } from '../../lib/upload'
import { csrf } from '../../middlewares/csrf.middleware'
import { validate } from '../../middlewares/validate.middleware'
import * as teamController from './team.controller'
import {
  createTeamMemberSchema,
  reorderTeamSchema,
  teamAdminFiltersSchema,
  teamPublicFiltersSchema,
  updateTeamMemberSchema,
} from './team.schemas'

export const teamAdminRouter = Router()

teamAdminRouter.get(
  '/',
  validate(teamAdminFiltersSchema, 'query'),
  teamController.listAdminTeamMembers
)
teamAdminRouter.post('/', csrf, validate(createTeamMemberSchema), teamController.createTeamMember)
teamAdminRouter.post('/reorder', csrf, validate(reorderTeamSchema), teamController.reorderTeam)
teamAdminRouter.get('/:id', teamController.getAdminTeamMember)
teamAdminRouter.patch(
  '/:id',
  csrf,
  validate(updateTeamMemberSchema),
  teamController.updateTeamMember
)
teamAdminRouter.delete('/:id', csrf, teamController.deleteTeamMember)
teamAdminRouter.post(
  '/:id/photo',
  csrf,
  uploadMiddleware.single('photo'),
  teamController.uploadPhoto
)

export const teamPublicRouter = Router()

teamPublicRouter.get(
  '/',
  validate(teamPublicFiltersSchema, 'query'),
  teamController.listPublicTeamMembers
)
