'use server'

import { revalidatePath } from 'next/cache'
import { createTeamMember, updateTeamMember, deleteTeamMember } from '@/lib/api/team'
import { ApiError } from '@/lib/api-client'

export interface TeamFormState {
  error?: string
  success?: string
}

function extractError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Erro inesperado. Tente novamente.'
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
    await createTeamMember({
      name: formData.get('name') as string,
      role: formData.get('role') as string,
      bio: formData.get('bio') as string,
      photoUrl: (formData.get('photoUrl') as string) || '/logos/foto_equipe.jpg',
    })
    revalidate()
    return { success: 'Membro criado.' }
  } catch (err) {
    return { error: extractError(err) }
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
      photoUrl: (formData.get('photoUrl') as string) || undefined,
    })
    revalidate()
    return { success: 'Membro salvo.' }
  } catch (err) {
    return { error: extractError(err) }
  }
}

export async function deleteTeamMemberAction(id: string): Promise<TeamFormState> {
  try {
    await deleteTeamMember(id)
    revalidate()
    return { success: 'Membro removido.' }
  } catch (err) {
    return { error: extractError(err) }
  }
}

export async function upsertTeamMemberAction(
  _state: TeamFormState,
  formData: FormData
): Promise<TeamFormState> {
  const id = (formData.get('memberId') as string | null) || null
  if (id) return updateTeamMemberAction(id, _state, formData)
  return createTeamMemberAction(_state, formData)
}
