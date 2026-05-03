'use server'

import { changeOwnPassword } from '@/lib/api/auth'
import { ApiError } from '@/lib/api-client'

export interface ProfileFormState {
  error?: string
  fieldErrors?: Record<string, string>
  success?: string
}

function extractFormState(err: unknown): ProfileFormState {
  if (err instanceof ApiError) {
    if (err.details && err.details.length > 0) {
      const fieldErrors: Record<string, string> = {}
      for (const detail of err.details) fieldErrors[detail.path || 'form'] = detail.message
      return { fieldErrors }
    }

    if (err.code === 'INVALID_CURRENT_PASSWORD') {
      return { fieldErrors: { currentPassword: 'Senha atual incorreta.' } }
    }

    return { error: err.message }
  }

  if (err instanceof Error) return { error: err.message }
  return { error: 'Erro inesperado. Tente novamente.' }
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

export async function changeOwnPasswordAction(
  _state: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const currentPassword = getString(formData, 'currentPassword')
  const newPassword = getString(formData, 'newPassword')
  const confirmPassword = getString(formData, 'confirmPassword')

  if (newPassword !== confirmPassword) {
    return { fieldErrors: { confirmPassword: 'A confirmacao nao confere.' } }
  }

  try {
    await changeOwnPassword({ currentPassword, newPassword, confirmPassword })
    return { success: 'Senha alterada com sucesso.' }
  } catch (err) {
    return extractFormState(err)
  }
}
