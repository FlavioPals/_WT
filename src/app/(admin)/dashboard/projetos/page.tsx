import Image from 'next/image'
import Link from 'next/link'
import { Eye, GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { PROJECT_CATEGORIES, PROJECTS } from '@/lib/projects'

export const metadata = {
  title: 'Projetos',
}

export default function DashboardProjetosPage() {
  const featuredProject = PROJECTS[0]

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Projetos</p>
          <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
            Gerenciar portfólio
          </h1>
        </div>

        <button
          type="button"
          className="bg-primary hover:bg-accent inline-flex h-10 items-center justify-center gap-2 px-4 text-sm text-white transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          Novo projeto
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="border-muted overflow-hidden border">
          <div className="border-muted bg-surface text-primary/45 grid grid-cols-[72px_1fr_120px_120px_132px] border-b px-4 py-3 text-[10px] tracking-[0.16em] uppercase">
            <span>Ordem</span>
            <span>Projeto</span>
            <span>Categoria</span>
            <span>Ano</span>
            <span className="text-right">Ações</span>
          </div>

          <div className="divide-muted divide-y">
            {PROJECTS.map((project, index) => (
              <div
                key={project.id}
                className="grid min-w-[760px] grid-cols-[72px_1fr_120px_120px_132px] items-center px-4 py-4"
              >
                <div className="text-primary/45 flex items-center gap-2">
                  <GripVertical size={16} strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-sm">{index + 1}</span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="bg-primary relative size-14 overflow-hidden">
                    {project.imageUrl && (
                      <Image
                        src={project.imageUrl}
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

                <p className="text-primary/65 text-sm">{project.category}</p>
                <p className="text-primary/65 text-sm">{project.year}</p>

                <div className="flex justify-end gap-1">
                  <Link
                    href={`/portfolio/${project.slug}`}
                    aria-label={`Ver ${project.title}`}
                    className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
                  >
                    <Eye size={16} strokeWidth={1.5} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    aria-label={`Editar ${project.title}`}
                    className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
                  >
                    <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Arquivar ${project.title}`}
                    className="text-primary/45 hover:bg-primary/5 hover:text-accent grid size-8 place-items-center transition-colors"
                  >
                    <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="border-muted bg-surface border p-5">
          <p className="text-primary/45 mb-5 text-[11px] tracking-[0.2em] uppercase">Formulário</p>

          <form className="grid gap-4">
            <label className="grid gap-2 text-sm">
              Título
              <input
                defaultValue={featuredProject.title}
                className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Slug
              <input
                defaultValue={featuredProject.slug}
                className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="grid gap-2 text-sm">
                Ano
                <input
                  defaultValue={featuredProject.year}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm">
                Categoria
                <select
                  defaultValue={featuredProject.category}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                >
                  {PROJECT_CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              Local
              <input
                defaultValue={featuredProject.location}
                className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Descrição
              <textarea
                defaultValue={featuredProject.description.join('\n\n')}
                rows={8}
                className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
              />
            </label>

            <label className="text-primary/70 flex items-center gap-3 text-sm">
              <input type="checkbox" defaultChecked className="accent-primary size-4" />
              Destacar na home
            </label>

            <button
              type="button"
              className="bg-primary hover:bg-accent mt-2 h-10 px-4 text-sm text-white transition-colors"
            >
              Salvar alterações
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}
