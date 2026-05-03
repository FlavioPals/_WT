import { adminGet, adminMutate, type Pagination } from '@/lib/api-client'

// Types

export type UserRole = 'ADMIN' | 'ARCHITECT'

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  active: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface AdminUsersParams {
  q?: string
  role?: UserRole
  active?: boolean
  deleted?: boolean
  page?: number
  limit?: number
  sort?: 'name' | 'email' | 'role' | 'createdAt' | 'lastLoginAt'
  direction?: 'asc' | 'desc'
}

export interface CreateUserInput {
  email: string
  name: string
  role: UserRole
  active?: boolean
  temporaryPassword?: string
}

export interface UpdateUserInput {
  email?: string
  name?: string
  role?: UserRole
  active?: boolean
}

export interface UserWithTemporaryPassword {
  user: AdminUser
  temporaryPassword: string
}

export interface RevokeUserSessionsResult {
  revokedSessions: number
}

// Admin

export async function getAdminUsers(params?: AdminUsersParams): Promise<{
  data: AdminUser[]
  pagination?: Pagination
}> {
  return adminGet<AdminUser[]>(
    '/admin/users',
    params as Record<string, string | number | boolean | undefined>
  )
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  const res = await adminGet<AdminUser>(`/admin/users/${id}`)
  return res.data
}

export async function createUser(data: CreateUserInput): Promise<UserWithTemporaryPassword> {
  const res = await adminMutate<{ data: UserWithTemporaryPassword }>('POST', '/admin/users', data)
  return res!.data
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<AdminUser> {
  const res = await adminMutate<{ data: AdminUser }>('PATCH', `/admin/users/${id}`, data)
  return res!.data
}

export async function deleteUser(id: string): Promise<void> {
  await adminMutate('DELETE', `/admin/users/${id}`)
}

export async function resetUserPassword(
  id: string,
  temporaryPassword?: string
): Promise<UserWithTemporaryPassword> {
  const res = await adminMutate<{ data: UserWithTemporaryPassword }>(
    'POST',
    `/admin/users/${id}/reset-password`,
    temporaryPassword !== undefined ? { temporaryPassword } : {}
  )
  return res!.data
}

export async function revokeUserSessions(id: string): Promise<RevokeUserSessionsResult> {
  const res = await adminMutate<{ data: RevokeUserSessionsResult }>(
    'POST',
    `/admin/users/${id}/revoke-sessions`
  )
  return res!.data
}

export type { Pagination }
