import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { JsonLd } from '@/components/seo/JsonLd'
import { ProjectCarousel } from '@/components/portfolio/ProjectCarousel'
import { ProjectDocViewer } from '@/components/portfolio/ProjectDocViewer'
import { cn } from '@/lib/utils'
import { absoluteUrl } from '@/lib/site'
import { getAdjacentProjects, getProjectBySlug, PROJECTS } from '@/lib/projects'
import { projectImageGalleryJsonLd } from '@/lib/structured-data'

type ProjectPageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return PROJECTS.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) return { title: 'Projeto não encontrado' }

  const description = `${project.category} em ${project.location}. Projeto ${project.title} do Studio WT Arquitetura e Design.`

  return {
    title: project.title,
    description,
    alternates: { canonical: `/portfolio/${project.slug}` },
    openGraph: {
      title: `${project.title} | Studio WT`,
      description,
      url: `/portfolio/${project.slug}`,
      images: project.imageUrl
        ? [{ url: absoluteUrl(project.imageUrl), alt: project.title }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${project.title} | Studio WT`,
      description,
      images: project.imageUrl ? [absoluteUrl(project.imageUrl)] : undefined,
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) notFound()

  const { previous, next } = getAdjacentProjects(project.slug)

  const galleryImages = project.images.filter((i) => i.type === 'gallery')
  const docImages = project.images.filter((i) => i.type === 'technical' || i.type === 'artistic')

  return (
    <article className="min-h-screen">
      <JsonLd data={projectImageGalleryJsonLd(project)} />

      {/* ── 1. HERO — foto de capa full-screen com ficha técnica ── */}
      <section className="bg-primary relative min-h-screen overflow-hidden">
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
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 to-transparent" />

        <div className="relative z-10 flex min-h-screen flex-col justify-end px-6 pt-32 pb-12 lg:px-20 lg:pb-20">
          <div className="mx-auto w-full max-w-7xl">
            <Link
              href="/portfolio"
              className="mb-10 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] text-white/55 uppercase transition-colors hover:text-white"
            >
              <ArrowLeft size={14} strokeWidth={1.5} aria-hidden="true" />
              Portfólio
            </Link>

            <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
              <div>
                <p className="mb-4 text-[11px] tracking-[0.22em] text-white/50 uppercase">
                  {project.category}
                </p>
                <h1 className="font-display max-w-4xl text-5xl leading-none font-light text-white sm:text-6xl lg:text-7xl">
                  {project.title}
                </h1>
              </div>

              <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/15 pt-8 text-sm lg:border-t-0 lg:border-l lg:pt-0 lg:pl-10">
                {[
                  ['Ano', project.year],
                  ['Área', project.area],
                  ['Local', project.location],
                  ['Categoria', project.category],
                ].map(([label, value]) => (
                  <div key={String(label)}>
                    <dt className="mb-1.5 text-[10px] tracking-[0.18em] text-white/40 uppercase">
                      {label}
                    </dt>
                    <dd className="text-white/80">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CARROSSEL — uma foto por vez com setas ── */}
      {galleryImages.length > 0 && (
        <ProjectCarousel
          images={galleryImages}
          title={project.title}
          location={project.location}
          year={project.year}
        />
      )}

      {/* ── 3. CONCEITO — título editorial + descrição ── */}
      <section className="px-6 py-20 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[380px_1fr] lg:gap-20">
            <div>
              <p className="mb-5 text-[11px] tracking-[0.22em] text-[#EFDFBB]/45 uppercase">
                Conceito
              </p>
              <h2 className="font-display text-3xl leading-tight font-light text-[#EFDFBB] lg:text-4xl">
                {project.concept}
              </h2>
            </div>

            <div className="flex flex-col gap-6 text-base leading-relaxed text-[#EFDFBB]/65 lg:pt-10 lg:text-lg">
              {project.description.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. DOCUMENTAÇÃO — técnicas + artísticas unificadas ── */}
      {docImages.length > 0 && (
        <section className="px-6 pb-20 lg:px-20 lg:pb-28">
          <div className="mx-auto max-w-7xl">
            <div className="border-t border-[#EFDFBB]/10 pt-10">
              <p className="mb-10 text-center text-[11px] tracking-[0.22em] text-[#EFDFBB]/45 uppercase">
                Documentação
              </p>
              <ProjectDocViewer images={docImages} />
            </div>
          </div>
        </section>
      )}

      {/* ── 5. NAVEGAÇÃO anterior / próximo ── */}
      <nav
        className="border-t border-[#EFDFBB]/10 px-6 py-10 lg:px-20"
        aria-label="Navegar entre projetos"
      >
        <div className="mx-auto grid max-w-7xl gap-px sm:grid-cols-2">
          {previous ? (
            <Link
              href={`/portfolio/${previous.slug}`}
              className="group flex items-center gap-5 py-6 pr-8 transition-opacity hover:opacity-80"
            >
              <span className="grid size-10 shrink-0 place-items-center border border-[#EFDFBB]/20 text-[#EFDFBB]/60 transition-all group-hover:border-[#EFDFBB]/50 group-hover:text-[#EFDFBB]">
                <ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="mb-1 block text-[10px] tracking-[0.18em] text-[#EFDFBB]/40 uppercase">
                  Anterior
                </span>
                <span className="font-display block truncate text-lg font-light text-[#EFDFBB]">
                  {previous.title}
                </span>
              </span>
            </Link>
          ) : (
            <div />
          )}

          {next && (
            <Link
              href={`/portfolio/${next.slug}`}
              className="group flex items-center justify-end gap-5 py-6 pl-8 text-right transition-opacity hover:opacity-80 sm:border-l sm:border-[#EFDFBB]/10"
            >
              <span className="min-w-0">
                <span className="mb-1 block text-[10px] tracking-[0.18em] text-[#EFDFBB]/40 uppercase">
                  Próximo
                </span>
                <span className="font-display block truncate text-lg font-light text-[#EFDFBB]">
                  {next.title}
                </span>
              </span>
              <span className="grid size-10 shrink-0 place-items-center border border-[#EFDFBB]/20 text-[#EFDFBB]/60 transition-all group-hover:border-[#EFDFBB]/50 group-hover:text-[#EFDFBB]">
                <ArrowRight size={16} strokeWidth={1.5} aria-hidden="true" />
              </span>
            </Link>
          )}
        </div>
      </nav>
    </article>
  )
}
