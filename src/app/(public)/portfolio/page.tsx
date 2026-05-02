import type { Metadata } from 'next'
import { ProjectGrid } from '@/components/portfolio/ProjectGrid'
import { JsonLd } from '@/components/seo/JsonLd'
import { PROJECT_CATEGORIES, PROJECTS } from '@/lib/projects'
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

export default function PortfolioPage() {
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
          <ProjectGrid projects={PROJECTS} categories={PROJECT_CATEGORIES} />
        </div>
      </div>
    </>
  )
}
