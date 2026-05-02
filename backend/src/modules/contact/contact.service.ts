import { env } from '../../config/env'
import { logger } from '../../lib/logger'
import { AppError } from '../../middlewares/error.middleware'
import type { ContactInput } from './contact.schemas'

interface ContactContext {
  requestId?: string
  ip?: string | null
  userAgent?: string | null
}

interface ContactResult {
  accepted: true
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function assertEmailDeliveryConfigured(): void {
  if (!env.RESEND_API_KEY || !env.CONTACT_FROM_EMAIL || !env.CONTACT_TO_EMAIL) {
    logger.warn('Contact form submitted before email delivery was configured.')
    throw new AppError(503, 'CONTACT_UNAVAILABLE', 'Contact delivery is not available right now.')
  }
}

function contactText(input: ContactInput, context: ContactContext): string {
  return [
    `Nome: ${input.name}`,
    `Email: ${input.email}`,
    `Telefone: ${input.phone ?? 'Nao informado'}`,
    `IP: ${context.ip ?? 'Nao informado'}`,
    `User-Agent: ${context.userAgent ?? 'Nao informado'}`,
    '',
    'Mensagem:',
    input.message,
  ].join('\n')
}

function contactHtml(input: ContactInput, context: ContactContext): string {
  return `
    <h2>Novo contato pelo site</h2>
    <p><strong>Nome:</strong> ${escapeHtml(input.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
    <p><strong>Telefone:</strong> ${escapeHtml(input.phone ?? 'Nao informado')}</p>
    <p><strong>IP:</strong> ${escapeHtml(context.ip ?? 'Nao informado')}</p>
    <p><strong>User-Agent:</strong> ${escapeHtml(context.userAgent ?? 'Nao informado')}</p>
    <hr />
    <p>${escapeHtml(input.message).replace(/\n/g, '<br />')}</p>
  `
}

async function sendWithResend(input: ContactInput, context: ContactContext): Promise<void> {
  assertEmailDeliveryConfigured()

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [env.CONTACT_TO_EMAIL],
      reply_to: input.email,
      subject: `${env.CONTACT_SUBJECT_PREFIX} ${input.name}`,
      text: contactText(input, context),
      html: contactHtml(input, context),
    }),
  })

  if (!response.ok) {
    logger.warn(
      { requestId: context.requestId, status: response.status },
      'Contact email provider rejected the request.'
    )
    throw new AppError(502, 'CONTACT_DELIVERY_FAILED', 'Unable to send contact message right now.')
  }
}

export async function submitContact(
  input: ContactInput,
  context: ContactContext
): Promise<ContactResult> {
  if (input.website) {
    logger.info({ requestId: context.requestId }, 'Contact submission ignored by honeypot.')
    return { accepted: true }
  }

  try {
    await sendWithResend(input, context)
    return { accepted: true }
  } catch (error) {
    if (error instanceof AppError) throw error

    logger.error({ err: error, requestId: context.requestId }, 'Contact email delivery failed.')
    throw new AppError(502, 'CONTACT_DELIVERY_FAILED', 'Unable to send contact message right now.')
  }
}
