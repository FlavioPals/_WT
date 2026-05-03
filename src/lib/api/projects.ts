import {
  adminGet,
  adminMutate,
  adminUpload,
  publicGet,
  summarizeApiError,
  type Pagination,
} from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectImage {
  id: string
  url: string
  publicId?: string | null
  type: 'GALLERY' | 'TECHNICAL' | 'ARTISTIC' | 'COVER'
  alt: string | null
  caption: string | null
  order: number
  width?: number | null
  height?: number | null
}

export interface ProjectImagesByType {
  gallery: ProjectImage[]
  technical: ProjectImage[]
  artistic: ProjectImage[]
  cover: ProjectImage[]
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
  images?: ProjectImagesByType
}

type RawProject = Omit<Project, 'images'> & {
  images?: ProjectImage[] | ProjectImagesByType
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

function emptyImages(): ProjectImagesByType {
  return { gallery: [], technical: [], artistic: [], cover: [] }
}

function isGroupedImages(value: unknown): value is ProjectImagesByType {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'gallery' in value &&
    'technical' in value &&
    'artistic' in value &&
    'cover' in value
  )
}

function normalizeProject(project: RawProject): Project {
  if (isGroupedImages(project.images)) return project as Project

  const grouped = emptyImages()
  for (const image of project.images ?? []) {
    if (image.type === 'TECHNICAL') grouped.technical.push(image)
    else if (image.type === 'ARTISTIC') grouped.artistic.push(image)
    else if (image.type === 'COVER') grouped.cover.push(image)
    else grouped.gallery.push(image)
  }

  return { ...project, images: grouped }
}

function normalizeProjectsResponse<T extends RawProject | RawProject[]>(
  data: T
): T extends RawProject[] ? Project[] : Project {
  if (Array.isArray(data)) {
    return data.map(normalizeProject) as T extends RawProject[] ? Project[] : Project
  }

  return normalizeProject(data) as T extends RawProject[] ? Project[] : Project
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function getPublicProjects(params?: ProjectListParams) {
  try {
    const res = await publicGet<RawProject[]>(
      '/public/projects',
      params as Record<string, string | number | boolean | undefined>
    )
    return { ...res, data: normalizeProjectsResponse(res.data) }
  } catch (error) {
    console.warn(`[public-data] Failed to load projects: ${summarizeApiError(error)}`)
    return {
      data: [],
      pagination: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 0,
        total: 0,
        totalPages: 0,
      },
    }
  }
}

export async function getProjectBySlug(slug: string) {
  const res = await publicGet<RawProject>(`/public/projects/${slug}`)
  return normalizeProjectsResponse(res.data)
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
  const res = await adminGet<RawProject[]>(
    '/admin/projects',
    params as Record<string, string | number | boolean | undefined>
  )
  return { ...res, data: normalizeProjectsResponse(res.data) }
}

export async function getAdminProject(id: string) {
  const res = await adminGet<RawProject>(`/admin/projects/${id}`)
  return normalizeProjectsResponse(res.data)
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

export async function deleteProjectImage(imageId: string): Promise<void> {
  await adminMutate('DELETE', `/admin/project-images/${imageId}`)
}

export async function reorderProjectImages(projectId: string, ids: string[]): Promise<void> {
  await adminMutate('POST', `/admin/projects/${projectId}/images/reorder`, { ids })
}

export type { Pagination }
