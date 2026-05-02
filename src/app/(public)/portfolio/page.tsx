import type { Metadata } from 'next'
import { ProjectGrid } from '@/components/portfolio/ProjectGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import { getPublicProjects } from '@/lib/api/projects'
import { absoluteUrl } from '@/lib/site'
import { portfolioCollectionJsonLd } from '@/lib/structured-data'

export const metadata: Metadata = {
  title: 'Portfólio',
  description:
    'Projetos residenciais, corporativos e de interiores do Studio WT Arquitetura e Design.',
  alternates: {
    canonical: '/portfolio',
  },
  openGraph: {
    title: 'Portfólio | Studio WT',
    description:
      'Projetos residenciais, corporativos e de interiores do Studio WT Arquitetura e Design.',
    url: '/portfolio',
    images: [
      {
        url: absoluteUrl('/logos/image/download.jpg'),
        alt: 'Projeto residencial do Studio WT',
      },
    ],
  },
}

export default async function PortfolioPage() {
  const { data: projects } = await getPublicProjects({ limit: 100, sort: 'order' })

  const categories = [...new Set(projects.map((p) => p.category).filter(Boolean))] as string[]

  // Adapt to the shape expected by ProjectGrid (which was built with mock data)
  const adapted = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    year: p.year ?? 0,
    category: p.category ?? '',
    location: p.location ?? '',
    area: p.area ?? '',
    imageUrl: p.coverImage ?? p.images?.gallery[0]?.url,
    gradient: 'bg-gradient-to-br from-stone-700 via-stone-800 to-neutral-900',
    concept: p.concept ?? '',
    description: [p.description],
    images: [
      ...(p.images?.gallery ?? []).map((i) => ({
        id: i.id,
        src: i.url,
        alt: i.alt ?? '',
        type: 'gallery' as const,
      })),
      ...(p.images?.technical ?? []).map((i) => ({
        id: i.id,
        src: i.url,
        alt: i.alt ?? '',
        type: 'technical' as const,
      })),
      ...(p.images?.artistic ?? []).map((i) => ({
        id: i.id,
        src: i.url,
        alt: i.alt ?? '',
        type: 'artistic' as const,
      })),
    ],
  }))

  return (
    <>
      <JsonLd data={portfolioCollectionJsonLd()} />
      <div className="min-h-screen px-6 pt-32 pb-24 lg:px-20 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-[11px] tracking-[0.22em] text-[#EFDFBB]/50 uppercase">
            Portfólio
          </p>
          <h1 className="font-display mb-16 text-4xl font-light text-[#EFDFBB] lg:text-5xl">
            Projetos
          </h1>
          <ProjectGrid projects={adapted} categories={categories} />
        </div>
      </div>
    </>
  )
}
