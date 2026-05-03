import { adminGet, adminMutate, adminUpload, publicGet, summarizeApiError } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  slug: string
  name: string
  role: string
  bio: string
  photoUrl: string
  email: string | null
  instagramUrl: string | null
  linkedinUrl: string | null
  order: number
}

export interface CreateTeamMemberInput {
  name: string
  role: string
  bio: string
  photoUrl?: string
  slug?: string
  photoPublicId?: string | null
  email?: string | null
  instagramUrl?: string | null
  linkedinUrl?: string | null
  active?: boolean
  order?: number
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function getPublicTeam() {
  try {
    const res = await publicGet<TeamMember[]>('/public/team', { limit: 50 })
    return res.data
  } catch (error) {
    console.warn(`[public-data] Failed to load team members: ${summarizeApiError(error)}`)
    return []
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminTeam() {
  const res = await adminGet<TeamMember[]>('/admin/team', { limit: 100 })
  return res.data
}

export async function createTeamMember(data: CreateTeamMemberInput): Promise<{ data: TeamMember }> {
  const res = await adminMutate<{ data: TeamMember }>('POST', '/admin/team', data)
  return res!
}

export async function updateTeamMember(
  id: string,
  data: Partial<CreateTeamMemberInput>
): Promise<{ data: TeamMember }> {
  const res = await adminMutate<{ data: TeamMember }>('PATCH', `/admin/team/${id}`, data)
  return res!
}

export async function deleteTeamMember(id: string): Promise<void> {
  await adminMutate('DELETE', `/admin/team/${id}`)
}

export async function reorderTeam(ids: string[]): Promise<void> {
  await adminMutate('POST', '/admin/team/reorder', { ids })
}

export async function uploadTeamPhoto(
  memberId: string,
  formData: FormData
): Promise<{ data: TeamMember }> {
  return adminUpload<{ data: TeamMember }>(`/admin/team/${memberId}/photo`, formData)
}
