import { Router } from 'express'
import { uploadMiddleware } from '../../lib/upload'
import { csrf } from '../../middlewares/csrf.middleware'
import { validate } from '../../middlewares/validate.middleware'
import { uploadMediaBodySchema } from '../media/media.schemas'
import * as siteContentController from './site-content.controller'
import {
  bulkUpdateSiteContentSchema,
  siteContentAdminFiltersSchema,
  siteContentPublicFiltersSchema,
  updateSiteContentSchema,
} from './site-content.schemas'

export const siteContentAdminRouter = Router()

siteContentAdminRouter.get(
  '/',
  validate(siteContentAdminFiltersSchema, 'query'),
  siteContentController.listAdminSiteContent
)
siteContentAdminRouter.patch(
  '/bulk',
  csrf,
  validate(bulkUpdateSiteContentSchema),
  siteContentController.bulkUpdateSiteContent
)
siteContentAdminRouter.get('/:key', siteContentController.getAdminSiteContent)
siteContentAdminRouter.post(
  '/:key/image',
  csrf,
  uploadMiddleware.single('image'),
  validate(uploadMediaBodySchema),
  siteContentController.uploadSiteContentImage
)
siteContentAdminRouter.put(
  '/:key',
  csrf,
  validate(updateSiteContentSchema),
  siteContentController.updateSiteContent
)

export const siteContentPublicRouter = Router()

siteContentPublicRouter.get(
  '/',
  validate(siteContentPublicFiltersSchema, 'query'),
  siteContentController.listPublicSiteContent
)
