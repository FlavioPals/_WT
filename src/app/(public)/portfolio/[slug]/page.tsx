import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ProjectGallery } from '@/components/portfolio/ProjectGallery'
import { cn } from '@/lib/utils'
import { getAdjacentProjects, getProjectBySlug, PROJECTS } from '@/lib/projects'

type ProjectPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    return {
      title: 'Projeto não encontrado',
    }
  }

  const description = `${project.category} em ${project.location}. Projeto ${project.title} do Studio WT Arquitetura e Design.`

  return {
    title: project.title,
    description,
    openGraph: {
      title: `${project.title} | Studio WT`,
      description,
      images: project.imageUrl ? [{ url: project.imageUrl, alt: project.title }] : undefined,
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const { previous, next } = getAdjacentProjects(project.slug)

  return (
    <article className="bg-surface min-h-screen">
      <section className="bg-primary relative min-h-screen overflow-hidden text-white">
        <div className={cn('absolute inset-0', project.gradient)}>
          {project.imageUrl && (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pt-32 pb-12 lg:px-20 lg:pb-20">
          <div className="mx-auto w-full max-w-7xl">
            <Link
              href="/portfolio"
              className="mb-10 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-white/65 uppercase transition-colors hover:text-white"
            >
              <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
              Portfólio
            </Link>

            <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="mb-4 text-[11px] tracking-[0.22em] text-white/60 uppercase">
                  {project.category}
                </p>
                <h1 className="font-display max-w-4xl text-5xl leading-none font-light tracking-normal text-white sm:text-6xl lg:text-7xl">
                  {project.title}
                </h1>
              </div>

              <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/20 pt-8 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                {[
                  ['Ano', project.year],
                  ['Local', project.location],
                  ['Área', project.area],
                  ['Categoria', project.category],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="mb-1 text-[10px] tracking-[0.18em] text-white/45 uppercase">
                      {label}
                    </dt>
                    <dd className="text-white/85">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[360px_1fr]">
          <div>
            <p className="text-muted-foreground mb-4 text-[11px] tracking-[0.22em] uppercase">
              Conceito
            </p>
            <h2 className="font-display text-primary text-3xl leading-tight font-light lg:text-4xl">
              Arquitetura pensada para atravessar a rotina com calma.
            </h2>
          </div>

          <div className="text-primary/75 grid gap-6 text-base leading-relaxed lg:text-lg">
            {project.description.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 lg:px-20 lg:pb-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-muted-foreground mb-3 text-[11px] tracking-[0.22em] uppercase">
                Galeria
              </p>
              <h2 className="font-display text-primary text-3xl font-light">Imagens do projeto</h2>
            </div>
          </div>

          <ProjectGallery images={project.images} title={project.title} />
        </div>
      </section>

      <nav className="border-muted border-t bg-white px-6 py-8 lg:px-20" aria-label="Projetos">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2">
          {previous && (
            <Link
              href={`/portfolio/${previous.slug}`}
              className="group flex items-center gap-4 py-4 text-left"
            >
              <span className="border-muted text-primary group-hover:border-primary grid size-10 shrink-0 place-items-center border transition-colors">
                <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span>
                <span className="text-muted-foreground block text-[10px] tracking-[0.18em] uppercase">
                  Projeto anterior
                </span>
                <span className="font-display text-primary text-xl font-light">
                  {previous.title}
                </span>
              </span>
            </Link>
          )}

          {next && (
            <Link
              href={`/portfolio/${next.slug}`}
              className="group flex items-center justify-start gap-4 py-4 text-left sm:justify-end sm:text-right"
            >
              <span>
                <span className="text-muted-foreground block text-[10px] tracking-[0.18em] uppercase">
                  Próximo projeto
                </span>
                <span className="font-display text-primary text-xl font-light">{next.title}</span>
              </span>
              <span className="border-muted text-primary group-hover:border-primary grid size-10 shrink-0 place-items-center border transition-colors">
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  )
}
