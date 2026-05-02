import { Router } from 'express'
import { uploadMiddleware } from '../../lib/upload'
import { csrf } from '../../middlewares/csrf.middleware'
import { requireRole } from '../../middlewares/require-role.middleware'
import { validate } from '../../middlewares/validate.middleware'
import * as mediaController from './media.controller'
import {
  mediaAdminFiltersSchema,
  updateMediaAssetSchema,
  uploadMediaBodySchema,
} from './media.schemas'

export const mediaAdminRouter = Router()

mediaAdminRouter.get(
  '/',
  validate(mediaAdminFiltersSchema, 'query'),
  mediaController.listMediaAssets
)
mediaAdminRouter.post(
  '/',
  csrf,
  uploadMiddleware.array('files', 20),
  validate(uploadMediaBodySchema),
  mediaController.uploadMediaAssets
)
mediaAdminRouter.get('/:id', mediaController.getMediaAsset)
mediaAdminRouter.patch(
  '/:id',
  csrf,
  validate(updateMediaAssetSchema),
  mediaController.updateMediaAsset
)
mediaAdminRouter.delete('/:id', csrf, mediaController.softDeleteMediaAsset)
mediaAdminRouter.delete(
  '/:id/cloudinary',
  csrf,
  requireRole('ADMIN'),
  mediaController.hardDeleteMediaAsset
)
