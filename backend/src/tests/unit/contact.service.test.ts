import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockEnv, mockLogger } = vi.hoisted(() => ({
  mockEnv: {
    RESEND_API_KEY: 'resend-test-key' as string | undefined,
    CONTACT_FROM_EMAIL: 'site@test.com' as string | undefined,
    CONTACT_TO_EMAIL: 'contato@test.com' as string | undefined,
    CONTACT_SUBJECT_PREFIX: '[Studio WT] Novo contato',
  },
  mockLogger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('../../config/env', () => ({ env: mockEnv }))
vi.mock('../../lib/logger', () => ({ logger: mockLogger }))

import { AppError } from '../../middlewares/error.middleware'
import { contactSchema, type ContactInput } from '../../modules/contact/contact.schemas'
import { submitContact } from '../../modules/contact/contact.service'

const validContact: ContactInput = {
  name: 'Ana Silva',
  email: 'ana@test.com',
  phone: '+55 (11) 99999-9999',
  message: 'Gostaria de conversar sobre um novo projeto residencial.',
  website: '',
}

describe('contact.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEnv.RESEND_API_KEY = 'resend-test-key'
    mockEnv.CONTACT_FROM_EMAIL = 'site@test.com'
    mockEnv.CONTACT_TO_EMAIL = 'contato@test.com'
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      })
    )
  })

  it('validates a public contact payload', () => {
    expect(contactSchema.safeParse(validContact).success).toBe(true)
    expect(contactSchema.safeParse({ ...validContact, message: 'Curta' }).success).toBe(false)
  })

  it('accepts honeypot submissions without sending email', async () => {
    const result = await submitContact(
      { ...validContact, website: 'https://spam.test' },
      { requestId: 'req-1' }
    )

    expect(result).toEqual({ accepted: true })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('returns a generic service error when email delivery is not configured', async () => {
    mockEnv.RESEND_API_KEY = undefined

    const promise = submitContact(validContact, { requestId: 'req-1' })

    await expect(promise).rejects.toBeInstanceOf(AppError)
    await expect(promise).rejects.toMatchObject({
      statusCode: 503,
      code: 'CONTACT_UNAVAILABLE',
    })
  })

  it('sends the contact email through Resend when configured', async () => {
    await submitContact(validContact, {
      requestId: 'req-1',
      ip: '127.0.0.1',
      userAgent: 'vitest',
    })

    expect(fetch).toHaveBeenCalledOnce()

    const [, init] = vi.mocked(fetch).mock.calls[0]
    const body = JSON.parse(String(init?.body))

    expect(init?.method).toBe('POST')
    expect(body).toMatchObject({
      from: 'site@test.com',
      to: ['contato@test.com'],
      reply_to: 'ana@test.com',
    })
    expect(body.text).toContain('Nome: Ana Silva')
    expect(body.text).toContain('User-Agent: vitest')
  })

  it('hides provider details when Resend rejects the message', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    )

    await expect(submitContact(validContact, { requestId: 'req-1' })).rejects.toMatchObject({
      statusCode: 502,
      code: 'CONTACT_DELIVERY_FAILED',
    })
  })
})
