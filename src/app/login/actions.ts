'use server'

import { redirect } from 'next/navigation'
import { callExpressLogin } from '@/lib/api/auth'

export interface LoginState {
  error?: string
}

function getSafeCallbackUrl(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.startsWith('/')) return '/dashboard'
  if (value.startsWith('//') || value.startsWith('/login')) return '/dashboard'
  return value
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = formData.get('email')
  const password = formData.get('password')

  if (typeof email !== 'string' || typeof password !== 'string') {
    return { error: 'Verifique os dados informados.' }
  }

  const result = await callExpressLogin(email.trim().toLowerCase(), password)

  if (result.error) {
    return { error: result.error }
  }

  const callbackUrl = getSafeCallbackUrl(formData.get('callbackUrl'))
  redirect(callbackUrl)
}
