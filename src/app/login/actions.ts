'use server'

import { AuthError } from 'next-auth'
import { signIn } from '@/auth'
import { signInSchema } from '@/lib/validations/auth'

export interface LoginState {
  error?: string
}

function getSafeCallbackUrl(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value.startsWith('/')) {
    return '/dashboard'
  }

  if (value.startsWith('//') || value.startsWith('/login')) {
    return '/dashboard'
  }

  return value
}

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = signInSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Verifique os dados informados.' }
  }

  try {
    await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: getSafeCallbackUrl(formData.get('callbackUrl')),
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-mail ou senha inválidos.' }
    }

    throw error
  }

  return {}
}
