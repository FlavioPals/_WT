'use client'

import { useActionState } from 'react'
import { LoaderCircle } from 'lucide-react'
import { createProjectAction, type ProjectFormState } from '../_actions'

const CATEGORIES = ['Residencial', 'Corporativo', 'Interiores', 'Retrofit']

const initialState: ProjectFormState = {}

function fieldError(state: ProjectFormState, field: string) {
  return state.fieldErrors?.[field]
}

function inputClass(hasError: boolean) {
  return `border bg-white px-3 transition-colors outline-none ${
    hasError ? 'border-red-400 focus:border-red-500' : 'border-muted focus:border-primary'
  }`
}

export function ProjectCreateForm() {
  const [state, formAction, pending] = useActionState(createProjectAction, initialState)

  return (
    <aside className="border-muted bg-surface border p-5">
      <p className="text-primary/45 mb-5 text-[11px] tracking-[0.2em] uppercase">Novo projeto</p>

      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2 text-sm">
          Titulo *
          <input
            name="title"
            required
            aria-describedby={fieldError(state, 'title') ? 'project-title-error' : undefined}
            className={`h-10 ${inputClass(!!fieldError(state, 'title'))}`}
            placeholder="Nome do projeto"
          />
          {fieldError(state, 'title') && (
            <p id="project-title-error" className="text-xs text-red-600" role="alert">
              {fieldError(state, 'title')}
            </p>
          )}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-2 text-sm">
            Ano
            <input
              name="year"
              type="number"
              aria-describedby={fieldError(state, 'year') ? 'project-year-error' : undefined}
              className={`h-10 ${inputClass(!!fieldError(state, 'year'))}`}
              placeholder={String(new Date().getFullYear())}
            />
            {fieldError(state, 'year') && (
              <p id="project-year-error" className="text-xs text-red-600" role="alert">
                {fieldError(state, 'year')}
              </p>
            )}
          </label>

          <label className="grid gap-2 text-sm">
            Categoria
            <select
              name="category"
              aria-describedby={
                fieldError(state, 'category') ? 'project-category-error' : undefined
              }
              className={`h-10 ${inputClass(!!fieldError(state, 'category'))}`}
            >
              <option value="">-- selecione --</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {fieldError(state, 'category') && (
              <p id="project-category-error" className="text-xs text-red-600" role="alert">
                {fieldError(state, 'category')}
              </p>
            )}
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          Local
          <input
            name="location"
            aria-describedby={fieldError(state, 'location') ? 'project-location-error' : undefined}
            className={`h-10 ${inputClass(!!fieldError(state, 'location'))}`}
            placeholder="Cidade, Estado"
          />
          {fieldError(state, 'location') && (
            <p id="project-location-error" className="text-xs text-red-600" role="alert">
              {fieldError(state, 'location')}
            </p>
          )}
        </label>

        <label className="grid gap-2 text-sm">
          Descricao *
          <textarea
            name="description"
            required
            rows={6}
            aria-describedby={
              fieldError(state, 'description') ? 'project-description-error' : undefined
            }
            className={`resize-none py-3 ${inputClass(!!fieldError(state, 'description'))}`}
            placeholder="Descricao do projeto..."
          />
          {fieldError(state, 'description') && (
            <p id="project-description-error" className="text-xs text-red-600" role="alert">
              {fieldError(state, 'description')}
            </p>
          )}
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

        {state.fieldErrors?.form && (
          <p
            className="border-accent/30 bg-accent/5 text-accent border px-3 py-2 text-sm"
            role="alert"
          >
            {state.fieldErrors.form}
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
