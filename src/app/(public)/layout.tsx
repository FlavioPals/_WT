import type { Metadata } from 'next'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Studio WT — Arquitetura e Design',
    template: '%s | Studio WT',
  },
  description:
    'Studio WT é um escritório de arquitetura e design baseado em São Paulo, com foco em projetos residenciais e comerciais de alta qualidade.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Studio WT Arquitetura e Design',
  },
}

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
