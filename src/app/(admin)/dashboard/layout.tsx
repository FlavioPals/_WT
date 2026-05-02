import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ExternalLink } from 'lucide-react'
import { AdminNav } from '@/components/admin/AdminNav'

export const metadata: Metadata = {
  title: {
    default: 'Dashboard',
    template: '%s | Dashboard',
  },
  robots: {
    index: false,
    follow: false,
  },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-primary min-h-screen bg-white">
      <aside className="border-muted bg-surface fixed inset-y-0 left-0 hidden w-72 border-r lg:flex lg:flex-col">
        <div className="border-muted flex h-20 items-center border-b px-8">
          <div className="relative h-8 w-48">
            <Image
              src="/logos/logo-dark.png"
              alt="Studio WT Arquitetura e Design"
              fill
              sizes="192px"
              className="object-contain object-left"
              priority
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between px-5 py-6">
          <AdminNav />

          <Link
            href="/"
            className="text-primary/55 hover:bg-primary/5 hover:text-primary flex h-10 items-center gap-3 px-3 text-sm transition-colors"
          >
            <ExternalLink size={16} strokeWidth={1.5} aria-hidden="true" />
            Ver site
          </Link>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="border-muted sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-6 lg:px-10">
            <div>
              <p className="text-primary/40 text-[10px] tracking-[0.18em] uppercase">Dashboard</p>
              <p className="text-primary/70 text-sm">Studio WT</p>
            </div>

            <div className="text-right">
              <p className="text-primary text-sm">Arquiteto Admin</p>
              <p className="text-primary/45 text-xs">Sessão local de desenvolvimento</p>
            </div>
          </div>
        </header>

        <div className="border-muted bg-surface border-b px-6 py-4 lg:hidden">
          <AdminNav />
        </div>

        <main className="px-6 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  )
}
