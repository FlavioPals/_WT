'use client'

import Image from 'next/image'
import { useActionState, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ImagePlus, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { TeamMember } from '@/lib/api/team'
import {
  deleteTeamMemberAction,
  reorderTeamAction,
  uploadTeamMemberPhotoAction,
  upsertTeamMemberAction,
  type TeamFormState,
} from '../_actions'

interface Props {
  initialMembers: TeamMember[]
}

const initialState: TeamFormState = {}

interface MemberRowProps {
  member: TeamMember
  index: number
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

function SortableMemberRow({ member, index, onEdit, onDelete }: MemberRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: member.id,
  })

  return (
    <article
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
      className="grid gap-5 bg-white p-5 md:grid-cols-[72px_160px_1fr_120px]"
    >
      <div className="text-primary/45 flex items-center gap-2">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="text-primary/25 hover:text-primary/55 cursor-grab touch-none transition-colors active:cursor-grabbing"
          aria-label="Arrastar para reordenar"
        >
          <GripVertical size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <span className="text-sm">{index + 1}</span>
      </div>

      <div className="bg-primary relative aspect-[4/5] overflow-hidden">
        <Image
          src={member.photoUrl || '/logos/foto_equipe.jpg'}
          alt={`Foto de ${member.name}`}
          fill
          sizes="160px"
          className="object-cover"
        />
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-primary/45 mb-2 text-[10px] tracking-[0.16em] uppercase">
          {member.role}
        </p>
        <h2 className="font-display text-2xl font-light">{member.name}</h2>
        <p className="text-primary/65 mt-4 line-clamp-3 text-sm leading-relaxed">{member.bio}</p>
      </div>

      <div className="flex items-start justify-end gap-1">
        <button
          type="button"
          onClick={() => onEdit(member.id)}
          aria-label={`Editar ${member.name}`}
          className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
        >
          <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(member.id)}
          aria-label={`Remover ${member.name}`}
          className="text-primary/45 hover:bg-primary/5 hover:text-accent grid size-8 place-items-center transition-colors"
        >
          <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}

export function TeamManager({ initialMembers }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(upsertTeamMemberAction, initialState)
  const [, startDelete] = useTransition()
  const [, startReorder] = useTransition()

  // Optimistic ordered list
  const [items, setItems] = useState(initialMembers)
  if (
    initialMembers.length !== items.length ||
    initialMembers.some((m, i) => m.id !== items[i]?.id)
  ) {
    setItems(initialMembers)
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  // Photo upload state (edit mode — immediate)
  const editPhotoRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoUploadError, setPhotoUploadError] = useState<string | undefined>()

  // Photo state for create mode (preview only, file input is inside the form)
  const createPhotoRef = useRef<HTMLInputElement>(null)
  const [createPhotoPreview, setCreatePhotoPreview] = useState<string | null>(null)

  const selected = items.find((m) => m.id === selectedId) ?? null

  function openCreate() {
    setSelectedId(null)
    setCreatePhotoPreview(null)
    setPhotoUploadError(undefined)
  }

  function openEdit(id: string) {
    setSelectedId(id)
    setCreatePhotoPreview(null)
    setPhotoUploadError(undefined)
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      await deleteTeamMemberAction(id)
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((m) => m.id === active.id)
    const newIndex = items.findIndex((m) => m.id === over.id)
    const reordered = arrayMove(items, oldIndex, newIndex)
    setItems(reordered)

    startReorder(async () => {
      await reorderTeamAction(reordered.map((m) => m.id))
    })
  }

  async function handleEditPhotoChange(files: FileList | null) {
    if (!files || files.length === 0 || !selectedId) return
    setUploadingPhoto(true)
    setPhotoUploadError(undefined)
    try {
      const formData = new FormData()
      formData.append('photo', files[0])
      const result = await uploadTeamMemberPhotoAction(selectedId, formData)
      if (result.error) setPhotoUploadError(result.error)
      else router.refresh()
    } catch (err) {
      setPhotoUploadError(err instanceof Error ? err.message : 'Erro ao enviar foto.')
    } finally {
      setUploadingPhoto(false)
      if (editPhotoRef.current) editPhotoRef.current.value = ''
    }
  }

  function handleCreatePhotoSelect(files: FileList | null) {
    const file = files?.[0]
    if (!file) return
    setCreatePhotoPreview(URL.createObjectURL(file))
  }

  const currentPhotoUrl = selected?.photoUrl

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {/* List */}
      <section className="border-muted border">
        {items.length === 0 && (
          <p className="text-primary/45 p-6 text-sm">Nenhum membro cadastrado ainda.</p>
        )}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            <div className="divide-muted divide-y">
              {items.map((member, index) => (
                <SortableMemberRow
                  key={member.id}
                  member={member}
                  index={index}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      {/* Form */}
      <aside className="border-muted bg-surface border p-5">
        <div className="mb-5 flex items-center justify-between">
          <p className="text-primary/45 text-[11px] tracking-[0.2em] uppercase">
            {selected ? 'Editar membro' : 'Novo membro'}
          </p>
          {selected && (
            <button
              type="button"
              onClick={openCreate}
              aria-label="Cancelar edição"
              className="text-primary/45 hover:text-primary transition-colors"
            >
              <X size={16} strokeWidth={1.5} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Photo section — outside main form in edit mode (immediate upload) */}
        {selected ? (
          <div className="border-muted mb-4 border p-3">
            <p className="text-primary/45 mb-3 text-[10px] tracking-[0.16em] uppercase">Foto</p>

            <input
              ref={editPhotoRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleEditPhotoChange(e.target.files)}
            />

            {photoUploadError && (
              <p className="border-accent/30 bg-accent/5 text-accent mb-2 border px-2 py-1.5 text-xs">
                {photoUploadError}
              </p>
            )}

            {currentPhotoUrl ? (
              <div className="flex items-end gap-3">
                <div
                  className="relative h-20 w-16 shrink-0 overflow-hidden bg-gray-100"
                  style={{
                    backgroundImage: `url(${currentPhotoUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center top',
                  }}
                />
                <button
                  type="button"
                  disabled={uploadingPhoto}
                  onClick={() => editPhotoRef.current?.click()}
                  className="border-muted text-primary/60 hover:border-primary hover:text-primary inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <LoaderCircle
                      size={12}
                      strokeWidth={1.5}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                  ) : null}
                  {uploadingPhoto ? 'Enviando…' : 'Trocar foto'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => editPhotoRef.current?.click()}
                className="border-muted flex w-full flex-col items-center gap-2 border border-dashed py-6 text-sm text-[#684933] transition-colors hover:border-[#684933] disabled:pointer-events-none disabled:opacity-50"
              >
                {uploadingPhoto ? (
                  <LoaderCircle
                    size={18}
                    strokeWidth={1.5}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <ImagePlus size={18} strokeWidth={1.5} aria-hidden="true" />
                )}
                {uploadingPhoto ? 'Enviando…' : 'Adicionar foto'}
              </button>
            )}
          </div>
        ) : null}

        <form key={selectedId ?? 'new'} action={formAction} className="grid gap-4">
          <input type="hidden" name="memberId" value={selectedId ?? ''} />

          {/* Photo picker — inside form only in create mode */}
          {!selected && (
            <div className="grid gap-1.5 text-sm">
              <span>Foto</span>
              <input
                ref={createPhotoRef}
                name="photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleCreatePhotoSelect(e.target.files)}
              />
              {createPhotoPreview ? (
                <div className="flex items-end gap-3">
                  <div
                    className="relative h-20 w-16 shrink-0 overflow-hidden bg-gray-100"
                    style={{
                      backgroundImage: `url(${createPhotoPreview})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center top',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => createPhotoRef.current?.click()}
                    className="border-muted text-primary/60 hover:border-primary hover:text-primary inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs tracking-wide transition-colors"
                  >
                    Trocar foto
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => createPhotoRef.current?.click()}
                  className="border-muted flex w-full flex-col items-center gap-2 border border-dashed py-6 text-sm text-[#684933] transition-colors hover:border-[#684933]"
                >
                  <ImagePlus size={18} strokeWidth={1.5} aria-hidden="true" />
                  Adicionar foto
                </button>
              )}
            </div>
          )}

          <div className="grid gap-1.5 text-sm">
            <label htmlFor="field-name">Nome *</label>
            <input
              id="field-name"
              name="name"
              defaultValue={selected?.name ?? ''}
              required
              aria-describedby={state.fieldErrors?.name ? 'err-name' : undefined}
              className={`h-10 border px-3 transition-colors outline-none ${
                state.fieldErrors?.name
                  ? 'border-red-400 bg-red-50 focus:border-red-500'
                  : 'border-muted focus:border-primary bg-white'
              }`}
            />
            {state.fieldErrors?.name && (
              <p id="err-name" className="text-xs text-red-600" role="alert">
                {state.fieldErrors.name}
              </p>
            )}
          </div>

          <div className="grid gap-1.5 text-sm">
            <label htmlFor="field-role">Função *</label>
            <input
              id="field-role"
              name="role"
              defaultValue={selected?.role ?? ''}
              required
              placeholder="ex: Arquiteta sócia"
              aria-describedby={state.fieldErrors?.role ? 'err-role' : undefined}
              className={`h-10 border px-3 transition-colors outline-none ${
                state.fieldErrors?.role
                  ? 'border-red-400 bg-red-50 focus:border-red-500'
                  : 'border-muted focus:border-primary bg-white'
              }`}
            />
            {state.fieldErrors?.role && (
              <p id="err-role" className="text-xs text-red-600" role="alert">
                {state.fieldErrors.role}
              </p>
            )}
          </div>

          <div className="grid gap-1.5 text-sm">
            <label htmlFor="field-bio">Biografia</label>
            <textarea
              id="field-bio"
              name="bio"
              defaultValue={selected?.bio ?? ''}
              rows={6}
              aria-describedby={state.fieldErrors?.bio ? 'err-bio' : undefined}
              className={`resize-none border px-3 py-3 transition-colors outline-none ${
                state.fieldErrors?.bio
                  ? 'border-red-400 bg-red-50 focus:border-red-500'
                  : 'border-muted focus:border-primary bg-white'
              }`}
            />
            {state.fieldErrors?.bio && (
              <p id="err-bio" className="text-xs text-red-600" role="alert">
                {state.fieldErrors.bio}
              </p>
            )}
          </div>

          {/* General error — includes any field error without a dedicated input */}
          {(state.error ||
            (state.fieldErrors &&
              Object.entries(state.fieldErrors).some(
                ([k]) => !['name', 'role', 'bio'].includes(k)
              ))) && (
            <p
              className="border-accent/30 bg-accent/5 text-accent border px-3 py-2 text-sm"
              role="alert"
            >
              {state.error ??
                Object.entries(state.fieldErrors!)
                  .filter(([k]) => !['name', 'role', 'bio'].includes(k))
                  .map(([, msg]) => msg)
                  .join(' · ')}
            </p>
          )}

          {state.success && (
            <p className="border-muted bg-surface border px-3 py-2 text-sm text-green-700">
              {state.success}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="bg-primary hover:bg-accent mt-2 inline-flex h-10 items-center justify-center gap-2 px-4 text-sm text-white transition-colors disabled:pointer-events-none disabled:opacity-60"
          >
            {pending && (
              <LoaderCircle
                size={15}
                strokeWidth={1.5}
                className="animate-spin"
                aria-hidden="true"
              />
            )}
            {selected ? 'Salvar alterações' : 'Criar membro'}
          </button>
        </form>
      </aside>

      {/* Floating new button anchor — visible on small screens */}
      <div className="flex justify-end xl:hidden">
        <button
          type="button"
          onClick={openCreate}
          className="bg-primary hover:bg-accent inline-flex h-10 items-center gap-2 px-4 text-sm text-white transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          Novo membro
        </button>
      </div>
    </div>
  )
}
