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
  reorderProjectImages,
} from '@/lib/api/projects'
import { ApiError } from '@/lib/api-client'

export interface ProjectFormState {
  error?: string
  fieldErrors?: Record<string, string>
  success?: string
}

const FIELD_LABELS: Record<string, string> = {
  title: 'Titulo',
  description: 'Descricao',
  concept: 'Conceito',
  year: 'Ano',
  location: 'Local',
  area: 'Area',
  category: 'Categoria',
  featured: 'Destacar na home',
  coverImage: 'Imagem de capa',
  slug: 'Slug',
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  'Title must be at least 2 characters.': 'Informe um titulo com pelo menos 2 caracteres.',
  'Description is required.': 'Informe a descricao do projeto.',
  'Expected string, received null.': 'Preencha o campo ou deixe-o vazio.',
  'Expected number, received nan.': 'Informe um numero valido.',
  'Expected boolean, received string.': 'Valor invalido para este campo.',
  'Invalid input.': 'Revise os campos destacados.',
}

function translateFieldError(path: string, message: string): string {
  const label = FIELD_LABELS[path] ?? path
  const translated = ERROR_TRANSLATIONS[message] ?? message
  return `${label}: ${translated}`
}

function extractFormState(err: unknown): ProjectFormState {
  if (err instanceof ApiError) {
    if (err.details && err.details.length > 0) {
      const fieldErrors: Record<string, string> = {}
      for (const detail of err.details) {
        fieldErrors[detail.path || 'form'] = translateFieldError(detail.path, detail.message)
      }
      return { error: 'Alguns campos precisam de ajuste.', fieldErrors }
    }

    return { error: ERROR_TRANSLATIONS[err.message] ?? err.message }
  }

  if (err instanceof Error) return { error: err.message }
  return { error: 'Erro inesperado. Tente novamente.' }
}

function getString(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

function getOptionalString(formData: FormData, key: string): string | undefined {
  const value = getString(formData, key)
  return value.length > 0 ? value : undefined
}

function getOptionalNumber(formData: FormData, key: string): number | undefined {
  const value = getString(formData, key)
  if (value.length === 0) return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : Number.NaN
}

function revalidate(slug?: string) {
  revalidatePath('/')
  revalidatePath('/portfolio')
  revalidatePath('/portfolio/[slug]', 'page')
  if (slug) revalidatePath(`/portfolio/${slug}`)
  revalidatePath('/dashboard/projetos')
}

export async function createProjectAction(
  _state: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  let projectId: string | undefined

  try {
    const res = await createProject({
      title: getString(formData, 'title'),
      description: getString(formData, 'description'),
      concept: getOptionalString(formData, 'concept'),
      year: getOptionalNumber(formData, 'year'),
      location: getOptionalString(formData, 'location'),
      area: getOptionalString(formData, 'area'),
      category: getOptionalString(formData, 'category'),
      featured: formData.get('featured') === 'on',
    })
    revalidate(res.data.slug)
    projectId = res.data.id
  } catch (err) {
    return extractFormState(err)
  }

  redirect(`/dashboard/projetos/${projectId}`)
}

export async function updateProjectAction(
  id: string,
  _state: ProjectFormState,
  formData: FormData
): Promise<ProjectFormState> {
  try {
    const res = await updateProject(id, {
      title: getString(formData, 'title'),
      description: getString(formData, 'description'),
      concept: getOptionalString(formData, 'concept'),
      year: getOptionalNumber(formData, 'year'),
      location: getOptionalString(formData, 'location'),
      area: getOptionalString(formData, 'area'),
      category: getOptionalString(formData, 'category'),
      featured: formData.get('featured') === 'on',
    })
    revalidate(res.data.slug)
    return { success: 'Projeto salvo.' }
  } catch (err) {
    return extractFormState(err)
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
    revalidatePath('/')
    revalidatePath(`/dashboard/projetos/${projectId}`)
    return { success: 'Imagem enviada.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function deleteProjectImageAction(imageId: string): Promise<ProjectFormState> {
  try {
    await deleteProjectImage(imageId)
    revalidatePath('/')
    return { success: 'Imagem removida.' }
  } catch (err) {
    return extractFormState(err)
  }
}

export async function reorderProjectImagesAction(
  projectId: string,
  ids: string[]
): Promise<ProjectFormState> {
  try {
    await reorderProjectImages(projectId, ids)
    revalidatePath('/')
    revalidatePath(`/dashboard/projetos/${projectId}`)
    return {}
  } catch (err) {
    return extractFormState(err)
  }
}
