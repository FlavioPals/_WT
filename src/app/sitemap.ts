import type { MetadataRoute } from 'next'
import { getPublicProjects } from '@/lib/api/projects'
import { absoluteUrl } from '@/lib/site'

const staticRoutes = [
  { path: '/', priority: 1 },
  { path: '/sobre', priority: 0.8 },
  { path: '/portfolio', priority: 0.9 },
  { path: '/equipe', priority: 0.7 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const { data: projects } = await getPublicProjects({ limit: 100, sort: 'order' })

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    })),
    ...projects.map((project) => ({
      url: absoluteUrl(`/portfolio/${project.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: [
        ...(project.coverImage ? [absoluteUrl(project.coverImage)] : []),
        ...(project.images?.gallery ?? []).map((image) => absoluteUrl(image.url)),
      ],
    })),
  ]
}
