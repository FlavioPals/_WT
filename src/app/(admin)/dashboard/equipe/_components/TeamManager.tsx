'use client'

import Image from 'next/image'
import { useActionState, useState, useTransition } from 'react'
import { GripVertical, LoaderCircle, Pencil, Plus, Trash2, X } from 'lucide-react'
import type { TeamMember } from '@/lib/api/team'
import { deleteTeamMemberAction, upsertTeamMemberAction, type TeamFormState } from '../_actions'

interface Props {
  initialMembers: TeamMember[]
}

const initialState: TeamFormState = {}

export function TeamManager({ initialMembers }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [state, formAction, pending] = useActionState(upsertTeamMemberAction, initialState)
  const [, startDelete] = useTransition()

  const selected = initialMembers.find((m) => m.id === selectedId) ?? null

  function openCreate() {
    setSelectedId(null)
  }

  function openEdit(id: string) {
    setSelectedId(id)
  }

  function handleDelete(id: string) {
    startDelete(async () => {
      await deleteTeamMemberAction(id)
    })
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
      {/* List */}
      <section className="divide-muted border-muted divide-y border">
        {initialMembers.length === 0 && (
          <p className="text-primary/45 p-6 text-sm">Nenhum membro cadastrado ainda.</p>
        )}
        {initialMembers.map((member, index) => (
          <article key={member.id} className="grid gap-5 p-5 md:grid-cols-[72px_160px_1fr_120px]">
            <div className="text-primary/45 flex items-center gap-2">
              <GripVertical size={16} strokeWidth={1.5} aria-hidden="true" />
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
              <p className="text-primary/65 mt-4 line-clamp-3 text-sm leading-relaxed">
                {member.bio}
              </p>
            </div>

            <div className="flex items-start justify-end gap-1">
              <button
                type="button"
                onClick={() => openEdit(member.id)}
                aria-label={`Editar ${member.name}`}
                className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
              >
                <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(member.id)}
                aria-label={`Remover ${member.name}`}
                className="text-primary/45 hover:bg-primary/5 hover:text-accent grid size-8 place-items-center transition-colors"
              >
                <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </div>
          </article>
        ))}
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

        <form key={selectedId ?? 'new'} action={formAction} className="grid gap-4">
          <input type="hidden" name="memberId" value={selectedId ?? ''} />

          <label className="grid gap-2 text-sm">
            Nome
            <input
              name="name"
              defaultValue={selected?.name ?? ''}
              required
              className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm">
            Função
            <input
              name="role"
              defaultValue={selected?.role ?? ''}
              required
              className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
            />
          </label>

          <label className="grid gap-2 text-sm">
            URL da foto
            <input
              name="photoUrl"
              defaultValue={selected?.photoUrl ?? ''}
              className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              placeholder="/logos/foto_equipe.jpg"
            />
          </label>

          <label className="grid gap-2 text-sm">
            Biografia
            <textarea
              name="bio"
              defaultValue={selected?.bio ?? ''}
              rows={6}
              className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
            />
          </label>

          {state.error && (
            <p
              className="border-accent/30 bg-accent/5 text-accent border px-3 py-2 text-sm"
              role="alert"
            >
              {state.error}
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
