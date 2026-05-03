'use server'

import { revalidatePath } from 'next/cache'
import {
  createUser,
  deleteUser,
  resetUserPassword,
  revokeUserSessions,
  updateUser,
  type UserRole,
} from '@/lib/api/users'
import { ApiError } from '@/lib/api-client'

export interface UserFormState {
  error?: string
  fieldErrors?: Record<string, string>
  success?: string
  temporaryPassword?: string
}

const ERROR_MESSAGES: Record<string, string> = {
  LAST_ACTIVE_ADMIN: 'Nao e possivel remover ou desativar o ultimo admin ativo.',
  FORBIDDEN: 'Voce nao tem permissao para gerenciar usuarios.',
  UNAUTHENTICATED: 'Sessao expirada. Faca login novamente.',
}

function extractFormState(err: unknown): UserFormState {
  if (err instanceof ApiError) {
    if (err.details && err.details.length > 0) {
      const fieldErrors: Record<string, string> = {}
      for (const detail of err.details) {
        fieldErrors[detail.path || 'form'] = detail.message
      }
      return { fieldErrors }
    }

    if (err.code === 'CONFLICT') {
      return { fieldErrors: { email: 'Este e-mail ja esta em uso.' } }
    }

    return { error: ERROR_MESSAGES[err.code] ?? err.message }
  }

  if (err instanceof Error) return { error: err.message }
  return { error: 'Erro inesperado. Tente novamente.' }
}

function revalidateUsers() {
  revalidatePath('/dashboard/usuarios')
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value : ''
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const value = getString(formData, key).trim()
  return value.length > 0 ? value : undefined
}

function getOptionalRole(formData: FormData): UserRole | undefined {
  const value = formData.get('role')
  return typeof value === 'string' && value.length > 0 ? (value as UserRole) : undefined
}

function getOptionalBoolean(formData: FormData, key: string): boolean | undefined {
  const values = formData.getAll(key).filter((value): value is string => typeof value === 'string')
  if (values.length === 0) return undefined
  return values.some((value) => value === 'true' || value === 'on')
}

export async function createUserAction(
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    const active = getOptionalBoolean(formData, 'active')
    const temporaryPassword = getOptionalString(formData, 'temporaryPassword')
    const confirmTemporaryPassword = getOptionalString(formData, 'confirmTemporaryPassword')

    if (temporaryPassword !== confirmTemporaryPassword) {
      return { fieldErrors: { confirmTemporaryPassword: 'A confirmacao nao confere.' } }
    }

    const result = await createUser({
      email: getString(formData, 'email'),
      name: getString(formData, 'name'),
      role: getOptionalRole(formData) ?? 'ARCHITECT',
      ...(active !== undefined ? { active } : {}),
      ...(temporaryPassword !== undefined ? { temporaryPassword } : {}),
    })

    revalidateUsers()
    return {
      success: 'Usuario criado.',
      temporaryPassword: result.temporaryPassword,
    }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function updateUserAction(
  id: string,
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    const active = getOptionalBoolean(formData, 'active')
    const role = getOptionalRole(formData)
    const temporaryPassword = getOptionalString(formData, 'temporaryPassword')
    const confirmTemporaryPassword = getOptionalString(formData, 'confirmTemporaryPassword')

    if (temporaryPassword !== confirmTemporaryPassword) {
      return { fieldErrors: { confirmTemporaryPassword: 'A confirmacao nao confere.' } }
    }

    await updateUser(id, {
      email: getString(formData, 'email'),
      name: getString(formData, 'name'),
      ...(role !== undefined ? { role } : {}),
      ...(active !== undefined ? { active } : {}),
    })

    if (temporaryPassword !== undefined) {
      const result = await resetUserPassword(id, temporaryPassword)
      revalidateUsers()
      return {
        success: 'Usuario salvo e senha alterada.',
        temporaryPassword: result.temporaryPassword,
      }
    }

    revalidateUsers()
    return { success: 'Usuario salvo.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function deleteUserAction(id: string): Promise<UserFormState> {
  try {
    await deleteUser(id)
    revalidateUsers()
    return { success: 'Usuario removido.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function resetPasswordAction(
  id: string,
  _state: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  try {
    const result = await resetUserPassword(id, getOptionalString(formData, 'temporaryPassword'))
    revalidateUsers()
    return {
      success: 'Senha redefinida.',
      temporaryPassword: result.temporaryPassword,
    }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function revokeSessionsAction(id: string): Promise<UserFormState> {
  try {
    const result = await revokeUserSessions(id)
    revalidateUsers()
    return { success: `${result.revokedSessions} sessoes revogadas.` }
  } catch (err) {
    return extractFormState(err)
  }
}
