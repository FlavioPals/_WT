'use client'

import { useActionState, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ImagePlus, LoaderCircle } from 'lucide-react'
import type { Project } from '@/lib/api/projects'
import {
  deleteProjectAction,
  deleteProjectImageAction,
  publishProjectAction,
  reorderProjectImagesAction,
  unpublishProjectAction,
  updateProjectAction,
  uploadProjectImagesAction,
  type ProjectFormState,
} from '../../_actions'
import { SortableImageList } from './SortableImageList'

const CATEGORIES = ['Residencial', 'Corporativo', 'Interiores', 'Retrofit']

type ImageSectionType = 'GALLERY' | 'TECHNICAL' | 'ARTISTIC'

const initialState: ProjectFormState = {}

interface Props {
  project: Project
}

export function ProjectEditForms({ project }: Props) {
  const router = useRouter()
  const boundUpdate = updateProjectAction.bind(null, project.id)
  const [state, formAction, pending] = useActionState(boundUpdate, initialState)

  const [uploading, setUploading] = useState<Partial<Record<ImageSectionType, boolean>>>({})
  const [uploadError, setUploadError] = useState<Partial<Record<ImageSectionType, string>>>({})
  const [deleting, setDeleting] = useState<Set<string>>(new Set())
  const [uploadingCover, setUploadingCover] = useState(false)
  const [coverError, setCoverError] = useState<string | undefined>()
  const [, startReorderTransition] = useTransition()

  const fileInputRefs = {
    GALLERY: useRef<HTMLInputElement>(null),
    TECHNICAL: useRef<HTMLInputElement>(null),
    ARTISTIC: useRef<HTMLInputElement>(null),
  }
  const coverInputRef = useRef<HTMLInputElement>(null)

  const galleryImages = project.images?.gallery ?? []
  const technicalImages = project.images?.technical ?? []
  const artisticImages = project.images?.artistic ?? []

  async function handleUpload(type: ImageSectionType, files: FileList | null) {
    if (!files || files.length === 0) return

    setUploading((prev) => ({ ...prev, [type]: true }))
    setUploadError((prev) => ({ ...prev, [type]: undefined }))

    try {
      const formData = new FormData()
      for (const file of Array.from(files)) {
        formData.append('files', file)
      }
      formData.append('type', type)

      const result = await uploadProjectImagesAction(project.id, {}, formData)
      if (result.error) {
        setUploadError((prev) => ({ ...prev, [type]: result.error }))
      } else {
        router.refresh()
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar imagem.'
      setUploadError((prev) => ({ ...prev, [type]: msg }))
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }))
      const ref = fileInputRefs[type].current
      if (ref) ref.value = ''
    }
  }

  function handleReorder(ids: string[]) {
    startReorderTransition(async () => {
      await reorderProjectImagesAction(project.id, ids)
    })
  }

  async function handleCoverUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadingCover(true)
    setCoverError(undefined)
    try {
      const formData = new FormData()
      formData.append('files', files[0])
      formData.append('type', 'COVER')
      const result = await uploadProjectImagesAction(project.id, {}, formData)
      if (result.error) {
        setCoverError(result.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setCoverError(err instanceof Error ? err.message : 'Erro ao enviar capa.')
    } finally {
      setUploadingCover(false)
      if (coverInputRef.current) coverInputRef.current.value = ''
    }
  }

  async function handleDelete(imageId: string) {
    setDeleting((prev) => new Set(prev).add(imageId))
    try {
      await deleteProjectImageAction(imageId)
      router.refresh()
    } catch {
      setDeleting((prev) => {
        const next = new Set(prev)
        next.delete(imageId)
        return next
      })
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
      {/* ── Main column ── */}
      <div className="flex flex-col gap-6">
        <form action={formAction} id="project-form">
          {/* General info */}
          <div className="border-muted mb-6 border p-6">
            <h2 className="font-display text-primary mb-6 text-xl font-light">
              Informações gerais
            </h2>
            <div className="grid gap-5">
              <div className="grid gap-2 sm:grid-cols-2">
                <label className="grid gap-1.5 text-sm">
                  Título
                  <input
                    name="title"
                    defaultValue={project.title}
                    required
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  Slug (URL)
                  <input
                    defaultValue={project.slug}
                    disabled
                    className="border-muted h-10 border bg-white px-3 font-mono text-sm opacity-50 outline-none"
                  />
                </label>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <label className="grid gap-1.5 text-sm">
                  Categoria
                  <select
                    name="category"
                    defaultValue={project.category ?? ''}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  >
                    <option value="">— selecione —</option>
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
                    name="year"
                    type="number"
                    defaultValue={project.year ?? ''}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  Área
                  <input
                    name="area"
                    defaultValue={project.area ?? ''}
                    className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                    placeholder="ex: 420 m²"
                  />
                </label>
              </div>

              <label className="grid gap-1.5 text-sm">
                Localização
                <input
                  name="location"
                  defaultValue={project.location ?? ''}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                />
              </label>
            </div>
          </div>

          {/* Concept + description */}
          <div className="border-muted border p-6">
            <h2 className="font-display text-primary mb-6 text-xl font-light">Texto e conceito</h2>
            <div className="grid gap-5">
              <label className="grid gap-1.5 text-sm">
                Frase do conceito
                <input
                  name="concept"
                  defaultValue={project.concept ?? ''}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 text-sm transition-colors outline-none"
                  placeholder="Frase curta e impactante do projeto"
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                Descrição completa
                <textarea
                  name="description"
                  defaultValue={project.description}
                  rows={8}
                  required
                  className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 text-sm leading-relaxed transition-colors outline-none"
                  placeholder="Parágrafos separados por linha em branco..."
                />
              </label>
            </div>
          </div>
        </form>

        {/* Images */}
        <div className="border-muted border p-6">
          <h2 className="font-display text-primary mb-6 text-xl font-light">Imagens</h2>
          {(
            [
              { label: 'Carrossel principal', type: 'GALLERY' as const, images: galleryImages },
              { label: 'Imagens técnicas', type: 'TECHNICAL' as const, images: technicalImages },
              { label: 'Imagens artísticas', type: 'ARTISTIC' as const, images: artisticImages },
            ] satisfies Array<{
              label: string
              type: ImageSectionType
              images: typeof galleryImages
            }>
          ).map((section) => (
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
                  disabled={uploading[section.type]}
                  onClick={() => fileInputRefs[section.type].current?.click()}
                  className="border-muted text-primary/60 hover:border-primary hover:text-primary inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  {uploading[section.type] ? (
                    <LoaderCircle
                      size={13}
                      strokeWidth={1.5}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <ImagePlus size={13} strokeWidth={1.5} aria-hidden="true" />
                  )}
                  {uploading[section.type] ? 'Enviando…' : 'Adicionar foto'}
                </button>
                <input
                  ref={fileInputRefs[section.type]}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUpload(section.type, e.target.files)}
                />
              </div>

              {uploadError[section.type] && (
                <p className="border-accent/30 bg-accent/5 text-accent mb-3 border px-3 py-2 text-xs">
                  {uploadError[section.type]}
                </p>
              )}

              {section.images.length === 0 ? (
                <div className="border-muted border border-dashed py-8 text-center">
                  <p className="text-primary/35 text-sm">Nenhuma imagem nesta categoria.</p>
                  <p className="text-primary/25 mt-1 text-xs">
                    Clique em &quot;Adicionar foto&quot; para enviar.
                  </p>
                </div>
              ) : (
                <SortableImageList
                  images={section.images}
                  deleting={deleting}
                  onDelete={handleDelete}
                  onReorder={handleReorder}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div className="flex flex-col gap-6">
        {/* Actions */}
        <div className="border-muted border p-5">
          <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">Publicação</p>

          {state.error && (
            <p
              className="border-accent/30 bg-accent/5 text-accent mb-3 border px-3 py-2 text-sm"
              role="alert"
            >
              {state.error}
            </p>
          )}
          {state.success && (
            <p className="border-muted bg-surface mb-3 border px-3 py-2 text-sm text-green-700">
              {state.success}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              form="project-form"
              disabled={pending}
              className="bg-primary hover:bg-accent inline-flex h-10 w-full items-center justify-center gap-2 text-sm tracking-wide text-white transition-colors disabled:pointer-events-none disabled:opacity-60"
            >
              {pending && (
                <LoaderCircle
                  size={15}
                  strokeWidth={1.5}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              Salvar alterações
            </button>

            {project.status === 'PUBLISHED' ? (
              <form action={unpublishProjectAction.bind(null, project.id, project.slug)}>
                <button
                  type="submit"
                  className="border-muted text-primary hover:border-primary flex h-10 w-full items-center justify-center border text-sm tracking-wide transition-colors"
                >
                  Despublicar
                </button>
              </form>
            ) : (
              <form action={publishProjectAction.bind(null, project.id, project.slug)}>
                <button
                  type="submit"
                  className="border-muted text-primary hover:border-primary flex h-10 w-full items-center justify-center border text-sm tracking-wide transition-colors"
                >
                  Publicar
                </button>
              </form>
            )}

            {project.status === 'PUBLISHED' && (
              <a
                href={`/portfolio/${project.slug}`}
                target="_blank"
                rel="noreferrer"
                className="border-muted text-primary/60 hover:border-primary flex h-10 w-full items-center justify-center border text-sm tracking-wide transition-colors"
              >
                Ver no site ↗
              </a>
            )}
          </div>
        </div>

        {/* Featured */}
        <div className="border-muted border p-5">
          <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">
            Visibilidade
          </p>
          <label className="flex cursor-pointer items-center justify-between gap-3">
            <span className="text-sm">Destaque na home</span>
            <input
              type="checkbox"
              name="featured"
              form="project-form"
              defaultChecked={project.featured}
              className="accent-primary h-4 w-4"
            />
          </label>
        </div>

        {/* Cover image */}
        <div className="border-muted border p-5">
          <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">
            Foto de capa
          </p>

          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleCoverUpload(e.target.files)}
          />

          {coverError && (
            <p className="border-accent/30 bg-accent/5 text-accent mb-3 border px-3 py-2 text-xs">
              {coverError}
            </p>
          )}

          {project.coverImage ? (
            <div>
              <div
                className="mb-3 aspect-video w-full overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${project.coverImage})` }}
              />
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="border-muted text-primary/60 hover:border-primary hover:text-primary inline-flex w-full items-center justify-center gap-1.5 border py-2 text-xs tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50"
              >
                {uploadingCover ? (
                  <LoaderCircle
                    size={13}
                    strokeWidth={1.5}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : null}
                {uploadingCover ? 'Enviando…' : 'Trocar imagem'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={uploadingCover}
              onClick={() => coverInputRef.current?.click()}
              className="border-muted flex w-full flex-col items-center gap-2 border border-dashed py-8 text-sm text-[#684933] transition-colors hover:border-[#684933] disabled:pointer-events-none disabled:opacity-50"
            >
              {uploadingCover ? (
                <LoaderCircle
                  size={20}
                  strokeWidth={1.5}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <ImagePlus size={20} strokeWidth={1.5} aria-hidden="true" />
              )}
              {uploadingCover ? 'Enviando…' : 'Enviar capa'}
            </button>
          )}
        </div>

        {/* Danger zone */}
        <div className="border-muted border p-5">
          <p className="text-primary/45 mb-4 text-[11px] tracking-[0.18em] uppercase">
            Zona de perigo
          </p>
          <form action={deleteProjectAction.bind(null, project.id, project.slug)}>
            <button
              type="submit"
              className="border-destructive/40 text-destructive hover:bg-destructive w-full border py-2 text-xs tracking-wide transition-colors hover:text-white"
            >
              Excluir projeto
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
