import Link from 'next/link'
import { ArrowLeft, ImagePlus, Trash2, GripVertical } from 'lucide-react'
import { getProjectBySlug, PROJECTS } from '@/lib/projects'
import { notFound } from 'next/navigation'

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ id: p.slug }))
}

const IMAGE_TYPES = [
  { value: 'gallery', label: 'Carrossel' },
  { value: 'technical', label: 'Técnica' },
  { value: 'artistic', label: 'Artística' },
]

const CATEGORIES = ['Residencial', 'Corporativo', 'Interiores', 'Retrofit']

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params
  const project = getProjectBySlug(id)

  if (!project) notFound()

  const galleryImages = project.images.filter((i) => i.type === 'gallery')
  const technicalImages = project.images.filter((i) => i.type === 'technical')
  const artisticImages = project.images.filter((i) => i.type === 'artistic')

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/projetos"
          className="text-primary/45 hover:text-primary mb-4 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase transition-colors"
        >
          <ArrowLeft size={13} strokeWidth={1.5} aria-hidden="true" />
          Projetos
        </Link>
        <p className="text-primary/45 mb-2 text-[11px] tracking-[0.22em] uppercase">
          Editar projeto
        </p>
        <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
          {project.title}
        </h1>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        {/* ── Coluna principal ── */}
        <div className="flex flex-col gap-6">
          {/* Dados básicos */}
          <div className="border-muted border p-6">
            <h2 className="font-display text-primary mb-6 text-xl font-light">
              Informações gerais
            </h2>

            <div className="grid gap-5">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  Título
                  <input
                    defaultValue={project.title}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  Slug (URL)
                  <input
                    defaultValue={project.slug}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 font-mono text-sm transition-colors outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <label className="grid gap-1.5 text-sm">
                  Categoria
                  <select
                    defaultValue={project.category}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-1.5 text-sm">
                  Ano
                  <input
                    type="number"
                    defaultValue={project.year}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  Área
                  <input
                    defaultValue={project.area}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                    placeholder="ex: 420 m²"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm">
                Localização
                <input
                  defaultValue={project.location}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                />
              </label>
            </div>
          </div>

          {/* Conceito e descrição */}
          <div className="border-muted border p-6">
            <h2 className="font-display text-primary mb-6 text-xl font-light">Texto e conceito</h2>

            <div className="grid gap-5">
              <label className="grid gap-1.5 text-sm">
                Frase do conceito
                <input
                  defaultValue={project.concept}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  placeholder="Frase curta e impactante do projeto"
                />
              </label>

              <label className="grid gap-1.5 text-sm">
                Descrição completa
                <textarea
                  defaultValue={project.description.join('\n\n')}
                  rows={8}
                  className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 text-sm leading-relaxed transition-colors outline-none"
                  placeholder="Parágrafos separados por linha em branco..."
                />
              </label>
            </div>
          </div>

          {/* Imagens */}
          <div className="border-muted border p-6">
            <h2 className="font-display text-primary mb-6 text-xl font-light">Imagens</h2>

            {[
              { label: 'Carrossel principal', type: 'gallery', images: galleryImages },
              { label: 'Imagens técnicas', type: 'technical', images: technicalImages },
              { label: 'Imagens artísticas', type: 'artistic', images: artisticImages },
            ].map((section) => (
              <div
                key={section.type}
                className="border-muted mb-8 border-b pb-8 last:mb-0 last:border-0 last:pb-0"
              >
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-primary/50 text-[11px] tracking-[0.18em] uppercase">
                    {section.label}
                  </p>
                  <button
                    type="button"
                    className="border-muted text-primary/60 hover:border-primary hover:text-primary inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs tracking-wide transition-colors"
                  >
                    <ImagePlus size={13} strokeWidth={1.5} aria-hidden="true" />
                    Adicionar foto
                  </button>
                </div>

                {section.images.length === 0 ? (
                  <div className="border-muted border border-dashed py-8 text-center">
                    <p className="text-primary/35 text-sm">Nenhuma imagem nesta categoria.</p>
                    <p className="text-primary/25 mt-1 text-xs">
                      Clique em &quot;Adicionar foto&quot; para enviar.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {section.images.map((image) => (
                      <div
                        key={image.id}
                        className="border-muted flex items-center gap-3 border bg-white/50 p-3"
                      >
                        <GripVertical
                          size={16}
                          strokeWidth={1.5}
                          className="text-primary/25 shrink-0 cursor-grab"
                          aria-hidden="true"
                        />
                        <div
                          className="bg-muted relative h-12 w-20 shrink-0 overflow-hidden"
                          style={{
                            backgroundImage: `url(${image.src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }}
                        />
                        <input
                          defaultValue={image.alt}
                          className="focus:border-primary min-w-0 flex-1 border-b border-transparent bg-transparent py-1 text-sm transition-colors outline-none"
                          placeholder="Texto alternativo..."
                        />
                        <select
                          defaultValue={image.type}
                          className="border-muted focus:border-primary shrink-0 border bg-white px-2 py-1 text-xs transition-colors outline-none"
                        >
                          {IMAGE_TYPES.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          aria-label="Remover imagem"
                          className="text-primary/30 hover:text-destructive shrink-0 transition-colors"
                        >
                          <Trash2 size={15} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Coluna lateral ── */}
        <div className="flex flex-col gap-6">
          {/* Ações */}
          <div className="border-muted border p-5">
            <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">
              Publicação
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="bg-primary hover:bg-accent h-10 w-full text-sm tracking-wide text-white transition-colors"
              >
                Salvar alterações
              </button>
              <Link
                href={`/portfolio/${project.slug}`}
                target="_blank"
                className="border-muted text-primary hover:border-primary flex h-10 w-full items-center justify-center border text-sm tracking-wide transition-colors"
              >
                Ver no site ↗
              </Link>
            </div>
          </div>

          {/* Destaque na home */}
          <div className="border-muted border p-5">
            <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">
              Visibilidade
            </p>
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span className="text-sm">Destaque na home</span>
              <input type="checkbox" className="accent-primary h-4 w-4" />
            </label>
          </div>

          {/* Foto de capa */}
          <div className="border-muted border p-5">
            <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">
              Foto de capa
            </p>
            {project.imageUrl ? (
              <div>
                <div
                  className="mb-3 aspect-video w-full overflow-hidden"
                  style={{
                    backgroundImage: `url(${project.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                />
                <button
                  type="button"
                  className="border-muted text-primary/60 hover:border-primary hover:text-primary w-full border py-2 text-xs tracking-wide transition-colors"
                >
                  Trocar imagem
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="border-muted flex w-full flex-col items-center gap-2 border border-dashed py-8 text-sm text-[#684933] transition-colors hover:border-[#684933]"
              >
                <ImagePlus size={20} strokeWidth={1.5} aria-hidden="true" />
                Enviar capa
              </button>
            )}
          </div>

          {/* Perigo */}
          <div className="border-muted border p-5">
            <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">
              Zona de perigo
            </p>
            <button
              type="button"
              className="border-destructive/40 text-destructive hover:bg-destructive w-full border py-2 text-xs tracking-wide transition-colors hover:text-white"
            >
              Excluir projeto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
