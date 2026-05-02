import { Router } from 'express'
import { coverRouter, projectImagesNestedRouter } from '../project-images/project-images.router'
import { csrf } from '../../middlewares/csrf.middleware'
import { validate } from '../../middlewares/validate.middleware'
import * as projectsController from './projects.controller'
import {
  createProjectSchema,
  projectAdminFiltersSchema,
  projectPublicFiltersSchema,
  reorderProjectsSchema,
  updateProjectSchema,
} from './projects.schemas'

// ─── Admin router (mounted under /admin/projects) ─────────────────────────────

export const projectsAdminRouter = Router()

projectsAdminRouter.get(
  '/',
  validate(projectAdminFiltersSchema, 'query'),
  projectsController.listAdminProjects
)
projectsAdminRouter.post('/', csrf, validate(createProjectSchema), projectsController.createProject)
projectsAdminRouter.post(
  '/reorder',
  csrf,
  validate(reorderProjectsSchema),
  projectsController.reorderProjects
)
projectsAdminRouter.get('/:id', projectsController.getAdminProject)
projectsAdminRouter.patch(
  '/:id',
  csrf,
  validate(updateProjectSchema),
  projectsController.updateProject
)
projectsAdminRouter.delete('/:id', csrf, projectsController.deleteProject)
projectsAdminRouter.post('/:id/restore', csrf, projectsController.restoreProject)
projectsAdminRouter.post('/:id/publish', csrf, projectsController.publishProject)
projectsAdminRouter.post('/:id/unpublish', csrf, projectsController.unpublishProject)

// ─── Nested image routes ──────────────────────────────────────────────────────

projectsAdminRouter.use('/:projectId/images', projectImagesNestedRouter)
projectsAdminRouter.use('/:projectId/cover', coverRouter)

// ─── Public router (mounted under /public/projects) ───────────────────────────

export const projectsPublicRouter = Router()

projectsPublicRouter.get(
  '/',
  validate(projectPublicFiltersSchema, 'query'),
  projectsController.listPublicProjects
)
projectsPublicRouter.get('/:slug', projectsController.getPublicProject)
