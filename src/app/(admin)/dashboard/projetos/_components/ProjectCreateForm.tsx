'use client'

import { useActionState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { createProjectAction, type ProjectFormState } from '../_actions'

const CATEGORIES = ['Residencial', 'Corporativo', 'Interiores', 'Retrofit']

const initialState: ProjectFormState = {}

export function ProjectCreateForm() {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState)

  return (
    <aside className="border-muted bg-surface border p-5">
      <p className="text-primary/45 mb-5 text-[11px] tracking-[0.2em] uppercase">Novo projeto</p>

      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2 text-sm">
          Título
          <input
            name="title"
            required
            className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
            placeholder="Nome do projeto"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm">
            Ano
            <input
              name="year"
              type="number"
              className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
              placeholder={String(new Date().getFullYear())}
            />
          </label>

          <label className="grid gap-2 text-sm">
            Categoria
            <select
              name="category"
              className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
            >
              <option value="">— selecione —</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          Local
          <input
            name="location"
            className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
            placeholder="Cidade, Estado"
          />
        </label>

        <label className="grid gap-2 text-sm">
          Descrição
          <textarea
            name="description"
            required
            rows={6}
            className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
            placeholder="Descrição do projeto..."
          />
        </label>

        <label className="text-primary/70 flex items-center gap-3 text-sm">
          <input type="checkbox" name="featured" className="accent-primary size-4" />
          Destacar na home
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
            <LoaderCircle size={15} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
          )}
          Criar projeto
        </button>
      </form>
    </aside>
  )
}
