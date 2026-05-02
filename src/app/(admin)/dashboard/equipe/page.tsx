import Image from 'next/image'
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react'
import { TEAM_MEMBERS } from '@/lib/team'

export const metadata = {
  title: 'Equipe',
}

export default function DashboardEquipePage() {
  const featuredMember = TEAM_MEMBERS[0]

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Equipe</p>
          <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
            Gerenciar profissionais
          </h1>
        </div>

        <button
          type="button"
          className="bg-primary hover:bg-accent inline-flex h-10 items-center justify-center gap-2 px-4 text-sm text-white transition-colors"
        >
          <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
          Novo membro
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="divide-muted border-muted divide-y border">
          {TEAM_MEMBERS.map((member, index) => (
            <article key={member.id} className="grid gap-5 p-5 md:grid-cols-[72px_160px_1fr_120px]">
              <div className="text-primary/45 flex items-center gap-2">
                <GripVertical size={16} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-sm">{index + 1}</span>
              </div>

              <div className="bg-primary relative aspect-[4/5] overflow-hidden">
                <Image
                  src={member.photoUrl}
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
                  aria-label={`Editar ${member.name}`}
                  className="text-primary/55 hover:bg-primary/5 hover:text-primary grid size-8 place-items-center transition-colors"
                >
                  <Pencil size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={`Arquivar ${member.name}`}
                  className="text-primary/45 hover:bg-primary/5 hover:text-accent grid size-8 place-items-center transition-colors"
                >
                  <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>
            </article>
          ))}
        </section>

        <aside className="border-muted bg-surface border p-5">
          <p className="text-primary/45 mb-5 text-[11px] tracking-[0.2em] uppercase">Formulário</p>

          <form className="grid gap-4">
            <label className="grid gap-2 text-sm">
              Nome
              <input
                defaultValue={featuredMember.name}
                className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Função
              <input
                defaultValue={featuredMember.role}
                className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Foto
              <input
                defaultValue={featuredMember.photoUrl}
                className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              />
            </label>

            <label className="grid gap-2 text-sm">
              Biografia
              <textarea
                defaultValue={featuredMember.bio}
                rows={8}
                className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
              />
            </label>

            <button
              type="button"
              className="bg-primary hover:bg-accent mt-2 h-10 px-4 text-sm text-white transition-colors"
            >
              Salvar membro
            </button>
          </form>
        </aside>
      </div>
    </div>
  )
}
