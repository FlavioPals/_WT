import { describe, expect, it, vi } from 'vitest'

vi.mock('../../config/env', () => ({
  env: {
    UPLOAD_MAX_FILE_SIZE_MB: 8,
    CLOUDINARY_CLOUD_NAME: 'test',
    CLOUDINARY_API_KEY: 'test',
    CLOUDINARY_API_SECRET: 'test',
    CLOUDINARY_FOLDER: 'test',
  },
}))

vi.mock('../../config/cloudinary', () => ({ cloudinary: {} }))

import { AppError } from '../../middlewares/error.middleware'
import {
  validateImageDimensions,
  validateMagicBytes,
  validateUploadFileSize,
} from '../../lib/upload'

// Minimal magic-byte headers — enough for file-type detection
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01])
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
  'base64'
)
const TRUNCATED_PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
])
const WEBP = Buffer.from([
  0x52,
  0x49,
  0x46,
  0x46, // RIFF
  0x00,
  0x00,
  0x00,
  0x00, // file size placeholder
  0x57,
  0x45,
  0x42,
  0x50, // WEBP
])
const PDF = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]) // %PDF-
const TEXT = Buffer.from('this is not an image at all')
const EMPTY = Buffer.alloc(0)

describe('validateMagicBytes', () => {
  it('accepts JPEG by magic bytes', async () => {
    await expect(validateMagicBytes(JPEG)).resolves.toBeUndefined()
  })

  it('accepts PNG by magic bytes', async () => {
    await expect(validateMagicBytes(PNG)).resolves.toBeUndefined()
  })

  it('accepts WebP by magic bytes', async () => {
    await expect(validateMagicBytes(WEBP)).resolves.toBeUndefined()
  })

  it('rejects a PDF buffer', async () => {
    await expect(validateMagicBytes(PDF)).rejects.toBeInstanceOf(AppError)
  })

  it('rejects a plain text buffer', async () => {
    await expect(validateMagicBytes(TEXT)).rejects.toBeInstanceOf(AppError)
  })

  it('rejects an empty buffer', async () => {
    await expect(validateMagicBytes(EMPTY)).rejects.toBeInstanceOf(AppError)
  })

  it('rejects a truncated image buffer', async () => {
    await expect(validateMagicBytes(TRUNCATED_PNG)).rejects.toBeInstanceOf(AppError)
  })

  it('rejects with UPLOAD_INVALID_TYPE code', async () => {
    await expect(validateMagicBytes(TEXT)).rejects.toMatchObject({
      code: 'UPLOAD_INVALID_TYPE',
    })
  })
})

describe('validateUploadFileSize', () => {
  it('accepts a file inside the configured limit', () => {
    expect(() => validateUploadFileSize(8 * 1024 * 1024)).not.toThrow()
  })

  it('rejects an oversized file', () => {
    expect(() => validateUploadFileSize(8 * 1024 * 1024 + 1)).toThrow(AppError)
  })

  it('rejects oversized files with UPLOAD_TOO_LARGE code', () => {
    try {
      validateUploadFileSize(8 * 1024 * 1024 + 1)
      throw new Error('Expected validateUploadFileSize to throw')
    } catch (error) {
      expect(error).toMatchObject({ code: 'UPLOAD_TOO_LARGE' })
    }
  })
})

describe('validateImageDimensions', () => {
  it('accepts normal image dimensions', () => {
    expect(() => validateImageDimensions({ width: 1920, height: 1080 })).not.toThrow()
  })

  it('rejects unreadable dimensions', () => {
    expect(() => validateImageDimensions({ width: 0, height: 1080 })).toThrow(AppError)
  })

  it('rejects overly large image dimensions', () => {
    try {
      validateImageDimensions({ width: 9000, height: 1080 })
      throw new Error('Expected validateImageDimensions to throw')
    } catch (error) {
      expect(error).toMatchObject({ code: 'UPLOAD_TOO_LARGE' })
    }
  })
})
