import type { Metadata } from 'next'
import { ProjectGrid } from '@/components/portfolio/ProjectGrid'
import { PROJECT_CATEGORIES, PROJECTS } from '@/lib/projects'

export const metadata: Metadata = {
  title: 'Portfólio',
  description:
    'Projetos residenciais, corporativos e de interiores do Studio WT Arquitetura e Design.',
}

export default function PortfolioPage() {
  return (
    <div className="bg-surface min-h-screen px-6 pt-32 pb-24 lg:px-20 lg:pt-40 lg:pb-32">
      <div className="mx-auto max-w-7xl">
        <p className="text-muted-foreground mb-4 text-[11px] tracking-[0.22em] uppercase">
          Portfólio
        </p>
        <h1 className="font-display text-primary mb-16 text-4xl font-light lg:text-5xl">
          Projetos
        </h1>
        <ProjectGrid projects={PROJECTS} categories={PROJECT_CATEGORIES} />
      </div>
    </div>
  )
}
