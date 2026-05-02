import type { MetadataRoute } from 'next'
import { PROJECTS } from '@/lib/projects'
import { absoluteUrl } from '@/lib/site'

const staticRoutes = [
  { path: '/', priority: 1 },
  { path: '/sobre', priority: 0.8 },
  { path: '/portfolio', priority: 0.9 },
  { path: '/equipe', priority: 0.7 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    })),
    ...PROJECTS.map((project) => ({
      url: absoluteUrl(`/portfolio/${project.slug}`),
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
      images: project.images.map((image) => absoluteUrl(image.src)),
    })),
  ]
}
