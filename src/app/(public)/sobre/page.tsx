import type { Metadata } from 'next'
import { AboutHero } from '@/components/about/AboutHero'

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

export default function SobrePage() {
  return <AboutHero />
}
