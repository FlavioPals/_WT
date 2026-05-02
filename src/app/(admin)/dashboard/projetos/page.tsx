import Image from 'next/image'
import Link from 'next/link'
import { Eye, GripVertical, Pencil, Plus } from 'lucide-react'
import { getAdminProjects } from '@/lib/api/projects'
import { ProjectCreateForm } from './_components/ProjectCreateForm'

export const metadata = {
  title: 'Projetos',
}

const STATUS_LABEL: Record<string, string> = {
  PUBLISHED: 'Publicado',
  DRAFT: 'Rascunho',
  ARCHIVED: 'Arquivado',
}

export default async function DashboardProjetosPage() {
  const { data: projects } = await getAdminProjects({ limit: 100, sort: 'order', direction: 'asc' })

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Projetos</p>
          <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
            Gerenciar portfólio
          </h1>
        </div>

        <p className="text-primary/45 hidden text-xs xl:block">
          Clique em editar para abrir o projeto
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="border-muted overflow-hidden border">
          <div className="border-muted bg-surface text-primary/45 grid grid-cols-[72px_1fr_120px_100px_132px] border-b px-4 py-3 text-[10px] tracking-[0.16em] uppercase">
            <span>Ordem</span>
            <span>Projeto</span>
            <span>Categoria</span>
            <span>Status</span>
            <span className="text-right">Ações</span>
          </div>

          {projects.length === 0 ? (
            <p className="text-primary/45 p-6 text-sm">Nenhum projeto cadastrado ainda.</p>
          ) : (
            <div className="divide-muted divide-y">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="grid min-w-[760px] grid-cols-[72px_1fr_120px_100px_132px] items-center px-4 py-4"
                >
                  <div className="text-primary/45 flex items-center gap-2">
                    <GripVertical size={16} strokeWidth={1.5} aria-hidden="true" />
                    <span className="text-sm">{index + 1}</span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="bg-primary relative size-14 overflow-hidden">
                      {project.coverImage && (
                        <Image
                          src={project.coverImage}
                          alt={project.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{project.title}</p>
                      <p className="text-primary/45 text-xs">/{project.slug}</p>
                    </div>
                  </div>

                  <p className="text-primary/65 text-sm">{project.category ?? '—'}</p>

                  <p className="text-primary/65 text-xs">
                    {STATUS_LABEL[project.status] ?? project.status}
                  </p>

                  <div className="flex justify-end gap-1">
                    {project.status === 'PUBLISHED' && (
                      <Link
                        href={`/portfolio/${project.slug}`}
                        target="_blank"
                        aria-label={`Ver ${project.title} no site`}
                        className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
                      >
                        <Eye size={16} strokeWidth={1.5} aria-hidden="true" />
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/projetos/${project.id}`}
                      aria-label={`Editar ${project.title}`}
                      className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
                    >
                      <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <ProjectCreateForm />
      </div>
    </div>
  )
}
