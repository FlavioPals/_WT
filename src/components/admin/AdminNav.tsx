'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, FolderKanban, UserCog, UserRound, Users } from 'lucide-react'
import type { AuthUser } from '@/lib/api/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Meu Perfil', href: '/dashboard/perfil', icon: UserRound },
  { label: 'Projetos', href: '/dashboard/projetos', icon: FolderKanban },
  { label: 'Equipe', href: '/dashboard/equipe', icon: Users },
  { label: 'Sobre', href: '/dashboard/conteudo', icon: FileText },
]

const adminOnlyNavItems = [{ label: 'Usuarios', href: '/dashboard/usuarios', icon: UserCog }]

interface AdminNavProps {
  role: AuthUser['role']
}

export function AdminNav({ role }: AdminNavProps) {
  const pathname = usePathname()
  const items = role === 'ADMIN' ? [...navItems, ...adminOnlyNavItems] : navItems

  return (
    <nav className="flex flex-col gap-1" aria-label="Navegacao do dashboard">
      {items.map((item) => {
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
