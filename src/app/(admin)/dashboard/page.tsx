import Link from 'next/link'
import { ArrowRight, FolderKanban, ImageIcon, Users } from 'lucide-react'
import { PROJECTS } from '@/lib/projects'
import { TEAM_MEMBERS } from '@/lib/team'

const stats = [
  { label: 'Projetos cadastrados', value: PROJECTS.length, icon: FolderKanban },
  { label: 'Membros da equipe', value: TEAM_MEMBERS.length, icon: Users },
  {
    label: 'Imagens em projetos',
    value: PROJECTS.reduce((total, project) => total + project.images.length, 0),
    icon: ImageIcon,
  },
]

const shortcuts = [
  {
    href: '/dashboard/projetos',
    title: 'Gerenciar projetos',
    description: 'Editar capas, textos, categorias e ordem do portfólio.',
  },
  {
    href: '/dashboard/equipe',
    title: 'Gerenciar equipe',
    description: 'Atualizar profissionais, funções, fotos e biografias.',
  },
  {
    href: '/dashboard/conteudo',
    title: 'Editar conteúdo do site',
    description: 'Ajustar manifesto, sobre, contatos e redes sociais.',
  },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-10">
        <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Visão geral</p>
        <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
          Painel administrativo
        </h1>
      </div>

      <div className="mb-10 grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon

          return (
            <div key={stat.label} className="border-muted bg-surface border p-5">
              <div className="mb-8 flex items-center justify-between">
                <p className="text-primary/60 text-sm">{stat.label}</p>
                <Icon size={18} strokeWidth={1.5} className="text-primary/45" aria-hidden="true" />
              </div>
              <p className="font-display text-4xl font-light">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {shortcuts.map((shortcut) => (
          <Link
            key={shortcut.href}
            href={shortcut.href}
            className="group border-muted hover:border-primary border p-5 transition-colors"
          >
            <div className="mb-10 flex items-center justify-between gap-4">
              <p className="text-primary/45 text-[11px] tracking-[0.18em] uppercase">Acessar</p>
              <ArrowRight
                size={17}
                strokeWidth={1.5}
                className="transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </div>
            <h2 className="font-display mb-3 text-2xl font-light">{shortcut.title}</h2>
            <p className="text-primary/60 text-sm leading-relaxed">{shortcut.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
