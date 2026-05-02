'use client'

import { useActionState } from 'react'
import { LoaderCircle, Mail, MapPin, Phone } from 'lucide-react'
import { updateSiteContentAction, type ContentFormState } from '../_actions'

interface Props {
  defaultValues: {
    manifesto: string
    about: string
    contactPhone: string
    contactEmail: string
    contactCity: string
    instagram: string
  }
}

const initialState: ContentFormState = {}

export function ContentForm({ defaultValues }: Props) {
  const [state, formAction, pending] = useActionState(updateSiteContentAction, initialState)

  return (
    <form action={formAction}>
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-6">
          <div className="border-muted border p-5">
            <div className="mb-6">
              <p className="text-primary/45 mb-2 text-[11px] tracking-[0.2em] uppercase">Home</p>
              <h2 className="font-display text-2xl font-light">Manifesto</h2>
            </div>
            <label className="grid gap-2 text-sm">
              Texto principal
              <textarea
                name="manifesto"
                defaultValue={defaultValues.manifesto}
                rows={5}
                className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
              />
            </label>
          </div>

          <div className="border-muted border p-5">
            <div className="mb-6">
              <p className="text-primary/45 mb-2 text-[11px] tracking-[0.2em] uppercase">Sobre</p>
              <h2 className="font-display text-2xl font-light">Texto institucional</h2>
            </div>
            <label className="grid gap-2 text-sm">
              Descrição
              <textarea
                name="about"
                defaultValue={defaultValues.about}
                rows={8}
                className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
              />
            </label>
          </div>

          <div className="border-muted border p-5">
            <div className="mb-6">
              <p className="text-primary/45 mb-2 text-[11px] tracking-[0.2em] uppercase">Contato</p>
              <h2 className="font-display text-2xl font-light">Rodapé e redes</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Telefone
                <input
                  name="contactPhone"
                  defaultValue={defaultValues.contactPhone}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm">
                E-mail
                <input
                  name="contactEmail"
                  defaultValue={defaultValues.contactEmail}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Cidade
                <input
                  name="contactCity"
                  defaultValue={defaultValues.contactCity}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>
              <label className="grid gap-2 text-sm">
                Instagram
                <input
                  name="instagram"
                  defaultValue={defaultValues.instagram}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>
            </div>
          </div>

          {state.error && (
            <p
              className="border-accent/30 bg-accent/5 text-accent border px-4 py-3 text-sm"
              role="alert"
            >
              {state.error}
            </p>
          )}

          {state.success && (
            <p className="border-muted bg-surface border px-4 py-3 text-sm text-green-700">
              {state.success}
            </p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pending}
              className="bg-primary hover:bg-accent inline-flex h-10 items-center gap-2 px-5 text-sm text-white transition-colors disabled:pointer-events-none disabled:opacity-60"
            >
              {pending && (
                <LoaderCircle
                  size={15}
                  strokeWidth={1.5}
                  className="animate-spin"
                  aria-hidden="true"
                />
              )}
              Salvar conteúdo
            </button>
          </div>
        </section>

        <aside className="border-muted bg-surface border p-5">
          <p className="text-primary/45 mb-5 text-[11px] tracking-[0.2em] uppercase">
            Prévia rápida
          </p>
          <div className="grid gap-4">
            {[
              { label: 'Telefone', value: defaultValues.contactPhone, icon: Phone },
              { label: 'E-mail', value: defaultValues.contactEmail, icon: Mail },
              { label: 'Cidade', value: defaultValues.contactCity, icon: MapPin },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.label} className="border-muted border-b pb-4">
                  <div className="text-primary/45 mb-2 flex items-center gap-2">
                    <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                    <p className="text-[10px] tracking-[0.16em] uppercase">{item.label}</p>
                  </div>
                  <p className="text-primary/75 text-sm">{item.value || '—'}</p>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </form>
  )
}
