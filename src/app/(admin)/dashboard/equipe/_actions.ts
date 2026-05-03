'use server'

import { revalidatePath } from 'next/cache'
import {
  createTeamMember,
  updateTeamMember,
  deleteTeamMember,
  uploadTeamPhoto,
  reorderTeam,
} from '@/lib/api/team'
import { ApiError } from '@/lib/api-client'

export interface TeamFormState {
  error?: string
  fieldErrors?: Record<string, string>
  success?: string
}

function extractFormState(err: unknown): TeamFormState {
  if (err instanceof ApiError) {
    if (err.details && err.details.length > 0) {
      const fieldErrors: Record<string, string> = {}
      for (const d of err.details) fieldErrors[d.path] = d.message
      return { fieldErrors }
    }
    return { error: err.message }
  }
  if (err instanceof Error) return { error: err.message }
  return { error: 'Erro inesperado. Tente novamente.' }
}

function revalidate() {
  revalidatePath('/equipe')
  revalidatePath('/dashboard/equipe')
}

export async function createTeamMemberAction(
  _state: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  try {
    const res = await createTeamMember({
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      bio: formData.get('bio') as string,
    })

    const photo = formData.get('photo')
    if (photo instanceof File && photo.size > 0) {
      const photoData = new FormData()
      photoData.append('photo', photo)
      await uploadTeamPhoto(res.data.id, photoData).catch(() => {})
    }

    revalidate()
    return { success: 'Membro criado.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function updateTeamMemberAction(
  id: string,
  _state: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  try {
    await updateTeamMember(id, {
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      bio: formData.get('bio') as string,
    })
    revalidate()
    return { success: 'Membro salvo.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function deleteTeamMemberAction(id: string): Promise<TeamFormState> {
  try {
    await deleteTeamMember(id)
    revalidate()
    return { success: 'Membro removido.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function uploadTeamMemberPhotoAction(
  memberId: string,
  formData: FormData
): Promise<TeamFormState> {
  try {
    await uploadTeamPhoto(memberId, formData)
    revalidate()
    return { success: 'Foto atualizada.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function reorderTeamAction(ids: string[]): Promise<void> {
  await reorderTeam(ids)
  revalidate()
}

export async function upsertTeamMemberAction(
  _state: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  const id = (formData.get('memberId') as string | null) || null
  if (id) return updateTeamMemberAction(id, _state, formData)
  return createTeamMemberAction(_state, formData)
}
