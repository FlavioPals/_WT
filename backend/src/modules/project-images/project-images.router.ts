import { Router } from 'express'
import { uploadMiddleware } from '../../lib/upload'
import { csrf } from '../../middlewares/csrf.middleware'
import { requireRole } from '../../middlewares/require-role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import * as projectImagesController from './project-images.controller'
import {
  listImagesQuerySchema,
  reorderImagesSchema,
  setCoverSchema,
  updateImageSchema,
  uploadImagesBodySchema,
} from './project-images.schemas'

// ─── Nested under /admin/projects/:projectId ─────────────────────────────────
// Mounted with mergeParams:true so /:projectId is accessible

export const projectImagesNestedRouter = Router({ mergeParams: true })

projectImagesNestedRouter.use(requireRole('ADMIN', 'ARCHITECT'))

projectImagesNestedRouter.get(
  '/',
  validate(listImagesQuerySchema, 'query'),
  projectImagesController.listImages
)
projectImagesNestedRouter.post(
  '/',
  csrf,
  uploadMiddleware.array('files', 20),
  validate(uploadImagesBodySchema),
  projectImagesController.uploadImages
)
projectImagesNestedRouter.post(
  '/reorder',
  csrf,
  validate(reorderImagesSchema),
  projectImagesController.reorderImages
)

// ─── Cover endpoint mounted directly on /admin/projects/:projectId/cover ─────

export const coverRouter = Router({ mergeParams: true })

coverRouter.use(requireRole('ADMIN', 'ARCHITECT'))

coverRouter.post('/', csrf, validate(setCoverSchema), projectImagesController.setCoverImage)

// ─── Standalone /admin/project-images/:imageId ────────────────────────────────

export const projectImagesRouter = Router()

projectImagesRouter.use(requireRole('ADMIN', 'ARCHITECT'))

projectImagesRouter.get('/:imageId', projectImagesController.getImage)
projectImagesRouter.patch(
  '/:imageId',
  csrf,
  validate(updateImageSchema),
  projectImagesController.updateImage
)
projectImagesRouter.delete('/:imageId', csrf, projectImagesController.softDeleteImage)
projectImagesRouter.delete('/:imageId/cloudinary', csrf, ...projectImagesController.hardDeleteImage)
