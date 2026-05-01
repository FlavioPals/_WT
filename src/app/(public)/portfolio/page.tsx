import type { Metadata } from 'next'
import { ProjectGrid } from '@/components/portfolio/ProjectGrid'
import type { Project } from '@/components/portfolio/ProjectCard'

export const metadata: Metadata = {
  title: 'Portfólio',
  description:
    'Projetos residenciais, corporativos e de interiores do Studio WT Arquitetura e Design.',
}

// TODO: replace with db.project.findMany({ orderBy: { order: 'asc' } })
const PROJECTS: Project[] = [
  {
    id: '1',
    slug: 'casa-itaim',
    title: 'Casa Itaim',
    year: 2024,
    category: 'Residencial',
    imageUrl: '/logos/image/download.jpg',
    gradient: 'bg-gradient-to-br from-stone-700 via-stone-800 to-neutral-900',
  },
  {
    id: '2',
    slug: 'escritorio-faria-lima',
    title: 'Escritório Faria Lima',
    year: 2023,
    category: 'Corporativo',
    imageUrl: '/logos/image/download (1).jpg',
    gradient: 'bg-gradient-to-br from-neutral-600 via-zinc-700 to-stone-900',
  },
  {
    id: '3',
    slug: 'cobertura-higienopolis',
    title: 'Cobertura Higienópolis',
    year: 2023,
    category: 'Residencial',
    imageUrl: '/logos/image/CreativeRender _ Soluções completas para lançamentos imobiliários.jpg',
    gradient: 'bg-gradient-to-br from-stone-500 via-neutral-700 to-zinc-900',
  },
  {
    id: '4',
    slug: 'casa-campos',
    title: 'Casa Campos do Jordão',
    year: 2022,
    category: 'Residencial',
    imageUrl: '/logos/image/Home_ The emotional side — comfort, warmth, family_.jpg',
    gradient: 'bg-gradient-to-br from-emerald-900 via-stone-800 to-neutral-900',
  },
  {
    id: '5',
    slug: 'loja-oscar-freire',
    title: 'Loja Oscar Freire',
    year: 2024,
    category: 'Corporativo',
    gradient: 'bg-gradient-to-br from-zinc-600 via-slate-700 to-stone-900',
  },
  {
    id: '6',
    slug: 'apartamento-brooklin',
    title: 'Apartamento Brooklin',
    year: 2023,
    category: 'Interiores',
    gradient: 'bg-gradient-to-br from-stone-400 via-stone-600 to-zinc-800',
  },
  {
    id: '7',
    slug: 'escritorio-vila-olimpia',
    title: 'Escritório Vila Olímpia',
    year: 2022,
    category: 'Retrofit',
    gradient: 'bg-gradient-to-br from-neutral-500 via-neutral-700 to-stone-900',
  },
  {
    id: '8',
    slug: 'penthouse-jardins',
    title: 'Penthouse Jardins',
    year: 2021,
    category: 'Residencial',
    gradient: 'bg-gradient-to-br from-stone-600 via-zinc-800 to-neutral-950',
  },
]

const CATEGORIES = [...new Set(PROJECTS.map((p) => p.category))]

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
        <ProjectGrid projects={PROJECTS} categories={CATEGORIES} />
      </div>
    </div>
  )
}
