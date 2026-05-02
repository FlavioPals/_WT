// TODO: replace mock text with SiteContent from DB (key: 'manifesto')
export function ManifestoSection() {
  return (
    <section className="px-6 py-24 lg:px-20 lg:py-36">
      <div className="mx-auto max-w-3xl">
        <p className="mb-12 text-[11px] tracking-[0.22em] text-[#EFDFBB]/50 uppercase">Manifesto</p>

        <blockquote className="font-display text-3xl leading-snug font-light text-[#EFDFBB] lg:text-5xl">
          Acreditamos que a arquitetura transforma não apenas espaços, mas a forma como as pessoas
          vivem, trabalham e se conectam.
        </blockquote>

        <div className="mt-16 grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 text-[11px] tracking-[0.18em] text-[#EFDFBB]/60 uppercase">
              Nossa abordagem
            </h3>
            <p className="text-sm leading-relaxed text-[#EFDFBB]/60">
              Cada projeto nasce de uma escuta profunda. Entendemos o estilo de vida, os sonhos e as
              necessidades de cada cliente antes de traçar a primeira linha.
            </p>
          </div>
          <div>
            <h3 className="mb-3 text-[11px] tracking-[0.18em] text-[#EFDFBB]/60 uppercase">
              Materiais e tempo
            </h3>
            <p className="text-sm leading-relaxed text-[#EFDFBB]/60">
              Priorizamos materiais naturais, texturas honestas e soluções que envelhecem bem —
              porque acreditamos que a beleza verdadeira se revela com o tempo.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
