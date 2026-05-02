import { Mail, MapPin, Phone } from 'lucide-react'
import { SITE_CONTENT } from '@/lib/site-content'

export const metadata = {
  title: 'Conteúdo',
}

export default function DashboardConteudoPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Conteúdo</p>
        <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
          Editar textos e contatos
        </h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="grid gap-6">
          <form className="border-muted border p-5">
            <div className="mb-6">
              <p className="text-primary/45 mb-2 text-[11px] tracking-[0.2em] uppercase">Home</p>
              <h2 className="font-display text-2xl font-light">Manifesto</h2>
            </div>

            <label className="grid gap-2 text-sm">
              Texto principal
              <textarea
                defaultValue={SITE_CONTENT.manifesto}
                rows={5}
                className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
              />
            </label>
          </form>

          <form className="border-muted border p-5">
            <div className="mb-6">
              <p className="text-primary/45 mb-2 text-[11px] tracking-[0.2em] uppercase">Sobre</p>
              <h2 className="font-display text-2xl font-light">Texto institucional</h2>
            </div>

            <label className="grid gap-2 text-sm">
              Descrição
              <textarea
                defaultValue={SITE_CONTENT.about}
                rows={8}
                className="border-muted focus:border-primary resize-none border bg-white px-3 py-3 transition-colors outline-none"
              />
            </label>
          </form>

          <form className="border-muted border p-5">
            <div className="mb-6">
              <p className="text-primary/45 mb-2 text-[11px] tracking-[0.2em] uppercase">Contato</p>
              <h2 className="font-display text-2xl font-light">Rodapé e redes</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                Telefone
                <input
                  defaultValue={SITE_CONTENT.contactPhone}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm">
                E-mail
                <input
                  defaultValue={SITE_CONTENT.contactEmail}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm">
                Cidade
                <input
                  defaultValue={SITE_CONTENT.contactCity}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>

              <label className="grid gap-2 text-sm">
                Instagram
                <input
                  defaultValue={SITE_CONTENT.instagram}
                  className="border-muted focus:border-primary h-10 border bg-white px-3 transition-colors outline-none"
                />
              </label>
            </div>
          </form>

          <div className="flex justify-end">
            <button
              type="button"
              className="bg-primary hover:bg-accent h-10 px-5 text-sm text-white transition-colors"
            >
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
              { label: 'Telefone', value: SITE_CONTENT.contactPhone, icon: Phone },
              { label: 'E-mail', value: SITE_CONTENT.contactEmail, icon: Mail },
              { label: 'Cidade', value: SITE_CONTENT.contactCity, icon: MapPin },
            ].map((item) => {
              const Icon = item.icon

              return (
                <div key={item.label} className="border-muted border-b pb-4">
                  <div className="text-primary/45 mb-2 flex items-center gap-2">
                    <Icon size={15} strokeWidth={1.5} aria-hidden="true" />
                    <p className="text-[10px] tracking-[0.16em] uppercase">{item.label}</p>
                  </div>
                  <p className="text-primary/75 text-sm">{item.value}</p>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
