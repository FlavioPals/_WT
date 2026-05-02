import { Request, Response } from 'express'
import { asyncHandler } from '../../lib/async-handler'
import { requireRole } from '../../middlewares/require-role.middleware'
import type {
  ListImagesQuery,
  ReorderImagesInput,
  SetCoverInput,
  UpdateImageInput,
  UploadImagesBody,
} from './project-images.schemas'
import * as projectImagesService from './project-images.service'

function meta(req: Request) {
  return { requestId: req.requestId, timestamp: new Date().toISOString() }
}

export const listImages = asyncHandler(async (req: Request, res: Response) => {
  const images = await projectImagesService.listProjectImages(
    req.params.projectId,
    req.query as unknown as ListImagesQuery
  )
  res.json({ data: images, meta: meta(req) })
})

export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[]
  const images = await projectImagesService.uploadImages(
    req.params.projectId,
    files,
    req.body as UploadImagesBody,
    req.user!.id
  )
  res.status(201).json({ data: images, meta: meta(req) })
})

export const getImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await projectImagesService.getImage(req.params.imageId)
  res.json({ data: image, meta: meta(req) })
})

export const updateImage = asyncHandler(async (req: Request, res: Response) => {
  const image = await projectImagesService.updateImage(
    req.params.imageId,
    req.body as UpdateImageInput,
    req.user!.id
  )
  res.json({ data: image, meta: meta(req) })
})

export const reorderImages = asyncHandler(async (req: Request, res: Response) => {
  await projectImagesService.reorderImages(
    req.params.projectId,
    req.body as ReorderImagesInput,
    req.user!.id
  )
  res.status(204).send()
})

export const softDeleteImage = asyncHandler(async (req: Request, res: Response) => {
  await projectImagesService.softDeleteImage(req.params.imageId, req.user!.id)
  res.status(204).send()
})

export const hardDeleteImage = [
  requireRole('ADMIN'),
  asyncHandler(async (req: Request, res: Response) => {
    await projectImagesService.hardDeleteImage(req.params.imageId, req.user!.id)
    res.status(204).send()
  }),
]

export const setCoverImage = asyncHandler(async (req: Request, res: Response) => {
  const result = await projectImagesService.setCoverImage(
    req.params.projectId,
    req.body as SetCoverInput,
    req.user!.id
  )
  res.json({ data: result, meta: meta(req) })
})
