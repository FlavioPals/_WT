import crypto from 'crypto'
import { env } from '../config/env'

const SEP = '.'

/** Generates a signed CSRF token: `nonce.hmac_sha256(nonce)` */
export function generateCsrfToken(): string {
  const nonce = crypto.randomBytes(16).toString('hex')
  const sig = sign(nonce)
  return `${nonce}${SEP}${sig}`
}

/** Verifies the CSRF token signature (timing-safe). */
export function verifyCsrfToken(token: string): boolean {
  const parts = token.split(SEP)
  if (parts.length !== 2) return false
  const [nonce, sig] = parts
  if (!nonce || !sig) return false

  const expected = sign(nonce)
  try {
    return crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

function sign(nonce: string): string {
  return crypto.createHmac('sha256', env.CSRF_SECRET).update(nonce).digest('hex')
}
