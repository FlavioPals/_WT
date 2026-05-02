import { adminGet, adminMutate, publicGet } from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SiteContent {
  key: string
  value: string
  label: string | null
  description: string | null
  type: 'TEXT' | 'RICH_TEXT' | 'IMAGE' | 'JSON' | 'URL' | 'EMAIL' | 'PHONE'
  group: string | null
  metadata: unknown
  updatedAt: string
}

export interface BulkUpdateItem {
  key: string
  value: string
  label?: string | null
  description?: string | null
  metadata?: unknown
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function getSiteContent(params?: {
  group?: string
  keys?: string
}): Promise<SiteContent[]> {
  const res = await publicGet<SiteContent[]>('/public/site', params)
  return res.data
}

export function getSiteContentValue(contents: SiteContent[], key: string, fallback = ''): string {
  return contents.find((c) => c.key === key)?.value ?? fallback
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export async function getAdminSiteContent(params?: { group?: string }): Promise<SiteContent[]> {
  const res = await adminGet<SiteContent[]>('/admin/site-content', params)
  return res.data
}

export async function bulkUpdateSiteContent(items: BulkUpdateItem[]): Promise<void> {
  await adminMutate('PATCH', '/admin/site-content/bulk', { items })
}

export async function updateSiteContent(key: string, value: string): Promise<void> {
  await adminMutate('PUT', `/admin/site-content/${key}`, { value })
}
