import type { UploadApiOptions, UploadApiResponse } from 'cloudinary'
import { fromBuffer } from 'file-type'
import multer from 'multer'
import sharp from 'sharp'
import { cloudinary } from '../config/cloudinary'
import { env } from '../config/env'
import { AppError } from '../middlewares/error.middleware'

const ALLOWED_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_BYTES = env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024
const MAX_IMAGE_SIDE = 8000

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 20 },
  fileFilter(_req, file, cb) {
    if (ALLOWED_MIMES.has(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new AppError(400, 'UPLOAD_INVALID_TYPE', `Type "${file.mimetype}" is not allowed.`))
    }
  },
})

export async function validateMagicBytes(buffer: Buffer): Promise<void> {
  let detected: Awaited<ReturnType<typeof fromBuffer>>

  try {
    detected = await fromBuffer(buffer)
  } catch {
    throw new AppError(400, 'UPLOAD_INVALID_TYPE', 'File content is not a valid image.')
  }

  if (!detected || !ALLOWED_MIMES.has(detected.mime)) {
    throw new AppError(400, 'UPLOAD_INVALID_TYPE', 'File content is not a valid image.')
  }
}

export function validateUploadFileSize(size: number): void {
  if (size > MAX_BYTES) {
    throw new AppError(
      413,
      'UPLOAD_TOO_LARGE',
      `File exceeds the ${env.UPLOAD_MAX_FILE_SIZE_MB}MB upload limit.`
    )
  }
}

export async function getImageDimensions(
  buffer: Buffer
): Promise<{ width: number; height: number; format: string }> {
  const meta = await sharp(buffer).metadata()
  return {
    width: meta.width ?? 0,
    height: meta.height ?? 0,
    format: meta.format ?? 'unknown',
  }
}

export function validateImageDimensions(dimensions: { width: number; height: number }): void {
  if (dimensions.width <= 0 || dimensions.height <= 0) {
    throw new AppError(400, 'UPLOAD_INVALID_TYPE', 'Image dimensions could not be read.')
  }

  if (dimensions.width > MAX_IMAGE_SIDE || dimensions.height > MAX_IMAGE_SIDE) {
    throw new AppError(
      413,
      'UPLOAD_TOO_LARGE',
      `Image dimensions must not exceed ${MAX_IMAGE_SIDE}px on either side.`
    )
  }
}

export function uploadToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) reject(error ?? new Error('Cloudinary upload failed'))
      else resolve(result)
    })
    stream.end(buffer)
  })
}
