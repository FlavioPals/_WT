'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import {
  createProject,
  updateProject,
  deleteProject,
  publishProject,
  unpublishProject,
  uploadProjectImages,
  deleteProjectImage,
} from '@/lib/api/projects'
import { ApiError } from '@/lib/api-client'

export interface ProjectFormState {
  error?: string
  success?: string
}

function extractError(err: unknown): string {
  if (err instanceof ApiError) return err.message
  if (err instanceof Error) return err.message
  return 'Erro inesperado. Tente novamente.'
}

function revalidate(slug?: string) {
  revalidatePath('/portfolio')
  revalidatePath('/portfolio/[slug]', 'page')
  if (slug) revalidatePath(`/portfolio/${slug}`)
  revalidatePath('/dashboard/projetos')
}

export async function createProjectAction(
  _state: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  try {
    const res = await createProject({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      concept: (formData.get('concept') as string) || null,
      year: formData.get('year') ? Number(formData.get('year')) : null,
      location: (formData.get('location') as string) || null,
      area: (formData.get('area') as string) || null,
      category: (formData.get('category') as string) || null,
      featured: formData.get('featured') === 'on',
    })
    revalidate(res.data.slug)
    return { success: 'Projeto criado.' }
  } catch (err) {
    return { error: extractError(err) }
  }
}

export async function updateProjectAction(
  id: string,
  _state: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  try {
    const res = await updateProject(id, {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      concept: (formData.get('concept') as string) || null,
      year: formData.get('year') ? Number(formData.get('year')) : null,
      location: (formData.get('location') as string) || null,
      area: (formData.get('area') as string) || null,
      category: (formData.get('category') as string) || null,
      featured: formData.get('featured') === 'on',
    })
    revalidate(res.data.slug)
    return { success: 'Projeto salvo.' }
  } catch (err) {
    return { error: extractError(err) }
  }
}

export async function deleteProjectAction(id: string, slug: string): Promise<void> {
  await deleteProject(id)
  revalidate(slug)
  redirect('/dashboard/projetos')
}

export async function publishProjectAction(id: string, slug: string): Promise<void> {
  await publishProject(id)
  revalidate(slug)
}

export async function unpublishProjectAction(id: string, slug: string): Promise<void> {
  await unpublishProject(id)
  revalidate(slug)
}

export async function uploadProjectImagesAction(
  projectId: string,
  _state: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  try {
    await uploadProjectImages(projectId, formData)
    revalidatePath(`/dashboard/projetos/${projectId}`)
    return { success: 'Imagem enviada.' }
  } catch (err) {
    return { error: extractError(err) }
  }
}

export async function deleteProjectImageAction(imageId: string): Promise<ProjectFormState> {
  try {
    await deleteProjectImage(imageId)
    return { success: 'Imagem removida.' }
  } catch (err) {
    return { error: extractError(err) }
  }
}
