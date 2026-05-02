'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, FolderKanban, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Projetos', href: '/dashboard/projetos', icon: FolderKanban },
  { label: 'Equipe', href: '/dashboard/equipe', icon: Users },
  { label: 'Sobre', href: '/dashboard/conteudo', icon: FileText },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação do dashboard">
      {navItems.map((item) => {
        const Icon = item.icon
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex h-10 items-center gap-3 px-3 text-sm transition-colors',
              active
                ? 'bg-primary text-white'
                : 'text-primary/70 hover:bg-primary/5 hover:text-primary'
            )}
          >
            <Icon size={16} strokeWidth={1.5} aria-hidden="true" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
