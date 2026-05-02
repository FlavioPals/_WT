import { Request, Response } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import type {
  BulkUpdateSiteContentInput,
  SiteContentAdminFilters,
  SiteContentPublicFilters,
  UpdateSiteContentInput,
} from './site-content.schemas'
import type { UploadMediaBody } from '../media/media.schemas'
import * as siteContentService from './site-content.service'

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

export const listAdminSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await siteContentService.listAdminSiteContent(
    req.query as unknown as SiteContentAdminFilters
  )
  res.json({ data: content, meta: meta(req) })
})

export const getAdminSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await siteContentService.getAdminSiteContent(req.params.key)
  res.json({ data: content, meta: meta(req) })
})

export const updateSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await siteContentService.updateSiteContent(
    req.params.key,
    req.body as UpdateSiteContentInput,
    req.user!.id
  )
  res.json({ data: content, meta: meta(req) })
})

export const bulkUpdateSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await siteContentService.bulkUpdateSiteContent(
    req.body as BulkUpdateSiteContentInput,
    req.user!.id
  )
  res.json({ data: content, meta: meta(req) })
})

export const uploadSiteContentImage = asyncHandler(async (req: Request, res: Response) => {
  const result = await siteContentService.uploadSiteContentImage(
    req.params.key,
    req.file as Express.Multer.File | undefined,
    req.body as UploadMediaBody,
    req.user!.id
  )
  res.status(201).json({ data: result, meta: meta(req) })
})

export const listPublicSiteContent = asyncHandler(async (req: Request, res: Response) => {
  const content = await siteContentService.listPublicSiteContent(
    req.query as unknown as SiteContentPublicFilters
  )
  res.json({ data: content, meta: meta(req) })
})
