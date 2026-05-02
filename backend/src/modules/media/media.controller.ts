import { Request, Response } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import type { MediaAdminFilters, UpdateMediaAssetInput, UploadMediaBody } from './media.schemas'
import * as mediaService from './media.service'

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

export const uploadMediaAssets = asyncHandler(async (req: Request, res: Response) => {
  const assets = await mediaService.uploadMediaAssets(
    req.files as Express.Multer.File[],
    req.body as UploadMediaBody,
    req.user!.id
  )
  res.status(201).json({ data: assets, meta: meta(req) })
})

export const listMediaAssets = asyncHandler(async (req: Request, res: Response) => {
  const result = await mediaService.listMediaAssets(req.query as unknown as MediaAdminFilters)
  res.json({ data: result.items, pagination: result.pagination, meta: meta(req) })
})

export const getMediaAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await mediaService.getMediaAsset(req.params.id)
  res.json({ data: asset, meta: meta(req) })
})

export const updateMediaAsset = asyncHandler(async (req: Request, res: Response) => {
  const asset = await mediaService.updateMediaAsset(
    req.params.id,
    req.body as UpdateMediaAssetInput,
    req.user!.id
  )
  res.json({ data: asset, meta: meta(req) })
})

export const softDeleteMediaAsset = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.softDeleteMediaAsset(req.params.id, req.user!.id)
  res.status(204).send()
})

export const hardDeleteMediaAsset = asyncHandler(async (req: Request, res: Response) => {
  await mediaService.hardDeleteMediaAsset(req.params.id, req.user!.id)
  res.status(204).send()
})
