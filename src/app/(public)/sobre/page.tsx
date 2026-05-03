import type { Metadata } from 'next'
import { AboutHero } from '@/components/about/AboutHero'
import { getSiteContent, getSiteContentValue } from '@/lib/api/site'

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'Conheça o Studio WT — escritório de arquitetura e design baseado em São Paulo, com foco em projetos residenciais e corporativos.',
  alternates: {
    canonical: '/sobre',
  },
  openGraph: {
    title: 'Sobre | Studio WT',
    description:
      'Conheça o Studio WT — escritório de arquitetura e design baseado em São Paulo, com foco em projetos residenciais e corporativos.',
    url: '/sobre',
  },
}

export default async function SobrePage() {
  const contents = await getSiteContent({ group: 'about' })
  const services = getSiteContentValue(contents, 'about_services')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const paragraphs = getSiteContentValue(contents, 'about_intro')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
  const founded = getSiteContentValue(contents, 'about_stats_founded')
  const projectCount = getSiteContentValue(contents, 'about_stats_projects')
  const team = getSiteContentValue(contents, 'about_stats_team')

  return (
    <AboutHero
      areas={services.length > 0 ? services : undefined}
      paragraphs={paragraphs.length > 0 ? paragraphs : undefined}
      founded={founded || undefined}
      projects={projectCount ? `+${projectCount}` : undefined}
      team={team || undefined}
    />
  )
}
