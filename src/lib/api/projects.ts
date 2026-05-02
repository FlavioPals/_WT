import { adminGet, adminMutate, adminUpload, publicGet, type Pagination } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectImage {
  id: string
  url: string
  publicId: string
  type: 'GALLERY' | 'TECHNICAL' | 'ARTISTIC' | 'COVER'
  alt: string | null
  caption: string | null
  order: number
  width: number
  height: number
}

export interface Project {
  id: string
  slug: string
  title: string
  description: string
  concept: string | null
  year: number | null
  location: string | null
  area: string | null
  category: string | null
  coverImage: string | null
  featured: boolean
  order: number
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  seoTitle: string | null
  seoDescription: string | null
  createdAt: string
  updatedAt: string
  images?: {
    gallery: ProjectImage[]
    technical: ProjectImage[]
    artistic: ProjectImage[]
    cover: ProjectImage[]
  }
}

export interface ProjectListParams {
  page?: number
  limit?: number
  category?: string
  featured?: boolean
  sort?: 'order' | 'year' | 'createdAt'
  direction?: 'asc' | 'desc'
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  deleted?: boolean
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function getPublicProjects(params?: ProjectListParams) {
  return publicGet<Project[]>(
    '/public/projects',
    params as Record<string, string | number | boolean | undefined>
  )
}

export async function getProjectBySlug(slug: string) {
  const res = await publicGet<Project>(`/public/projects/${slug}`)
  return res.data
}

export function getAdjacentProjects(
  projects: Project[],
  slug: string
): { previous: Project | null; next: Project | null } {
  const idx = projects.findIndex((p) => p.slug === slug)
  if (idx === -1) return { previous: null, next: null }
  return {
    previous: projects[(idx - 1 + projects.length) % projects.length] ?? null,
    next: projects[(idx + 1) % projects.length] ?? null,
  }
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminProjects(params?: ProjectListParams) {
  return adminGet<Project[]>(
    '/admin/projects',
    params as Record<string, string | number | boolean | undefined>
  )
}

export async function getAdminProject(id: string) {
  const res = await adminGet<Project>(`/admin/projects/${id}`)
  return res.data
}

export interface CreateProjectInput {
  title: string
  description: string
  slug?: string
  concept?: string | null
  year?: number | null
  location?: string | null
  area?: string | null
  category?: string | null
  featured?: boolean
  order?: number
  seoTitle?: string | null
  seoDescription?: string | null
}

export async function createProject(data: CreateProjectInput): Promise<{ data: Project }> {
  const res = await adminMutate<{ data: Project }>('POST', '/admin/projects', data)
  return res!
}

export async function updateProject(
  id: string,
  data: Partial<CreateProjectInput>
): Promise<{ data: Project }> {
  const res = await adminMutate<{ data: Project }>('PATCH', `/admin/projects/${id}`, data)
  return res!
}

export async function deleteProject(id: string): Promise<void> {
  await adminMutate('DELETE', `/admin/projects/${id}`)
}

export async function publishProject(id: string): Promise<{ data: Project }> {
  const res = await adminMutate<{ data: Project }>('POST', `/admin/projects/${id}/publish`)
  return res!
}

export async function unpublishProject(id: string): Promise<{ data: Project }> {
  const res = await adminMutate<{ data: Project }>('POST', `/admin/projects/${id}/unpublish`)
  return res!
}

export async function reorderProjects(ids: string[]): Promise<void> {
  await adminMutate('POST', '/admin/projects/reorder', { ids })
}

export async function uploadProjectImages(
  projectId: string,
  formData: FormData
): Promise<{ data: ProjectImage[] }> {
  return adminUpload<{ data: ProjectImage[] }>(`/admin/projects/${projectId}/images`, formData)
}

export type { Pagination }
