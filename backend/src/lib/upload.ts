import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
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

// Resolved once at startup: backend/ → ../public/uploads/
const LOCAL_UPLOADS_DIR = path.resolve(process.cwd(), '..', 'public', 'uploads')

function isCloudinaryConfigured(): boolean {
  return (
    env.CLOUDINARY_API_KEY !== 'placeholder' &&
    env.CLOUDINARY_CLOUD_NAME !== 'placeholder' &&
    env.CLOUDINARY_API_SECRET !== 'placeholder'
  )
}

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

async function uploadToLocal(
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  // Use the last segment of the folder path as subdirectory (e.g. "team" or the project id)
  const rawFolder = (options.folder ?? 'misc').replace(/^arquitetos-portfolio\/?/, '')
  const subFolder = rawFolder.replace(/[^a-zA-Z0-9_/-]/g, '') || 'misc'

  const uploadDir = path.join(LOCAL_UPLOADS_DIR, subFolder)
  await fs.mkdir(uploadDir, { recursive: true })

  const filename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.jpg`
  const filePath = path.join(uploadDir, filename)

  const jpeg = await sharp(buffer).jpeg({ quality: 85 }).toBuffer()
  await fs.writeFile(filePath, jpeg)

  const publicId = `local/${subFolder}/${filename}`
  const url = `/uploads/${subFolder}/${filename}`

  return {
    secure_url: url,
    url,
    public_id: publicId,
    format: 'jpg',
    resource_type: 'image',
    created_at: new Date().toISOString(),
    bytes: jpeg.length,
    type: 'upload',
  } as unknown as UploadApiResponse
}

export async function deleteFromStorage(publicId: string | null): Promise<void> {
  if (!publicId) return

  if (publicId.startsWith('local/')) {
    // Local file: derive path from publicId (local/subFolder/filename)
    const relativePath = publicId.replace(/^local\//, '')
    const filePath = path.join(LOCAL_UPLOADS_DIR, relativePath)
    await fs.unlink(filePath).catch(() => {})
    return
  }

  if (isCloudinaryConfigured()) {
    await cloudinary.uploader.destroy(publicId).catch(() => {})
  }
}

export function uploadToCloudinary(
  buffer: Buffer,
  options: UploadApiOptions
): Promise<UploadApiResponse> {
  if (!isCloudinaryConfigured()) {
    return uploadToLocal(buffer, options)
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error || !result) reject(error ?? new Error('Cloudinary upload failed'))
      else resolve(result)
    })
    stream.end(buffer)
  })
}
