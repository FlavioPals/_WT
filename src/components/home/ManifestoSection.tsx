interface ManifestoSectionProps {
  title?: string
  body?: string
}

const FALLBACK_TITLE =
  'Acreditamos que a arquitetura transforma nao apenas espacos, mas a forma como as pessoas vivem, trabalham e se conectam.'

const FALLBACK_BODY =
  'Cada projeto nasce de uma escuta profunda. Entendemos o estilo de vida, os sonhos e as necessidades de cada cliente antes de tracar a primeira linha.'

export function ManifestoSection({ title, body }: ManifestoSectionProps) {
  const safeTitle = title?.trim() || FALLBACK_TITLE
  const paragraphs = (body?.trim() || FALLBACK_BODY)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <section className="px-6 py-24 lg:px-20 lg:py-36">
      <div className="mx-auto max-w-3xl">
        <p className="mb-12 text-[11px] tracking-[0.22em] text-[#EFDFBB]/50 uppercase">Manifesto</p>

        <blockquote className="font-display text-3xl leading-snug font-light text-[#EFDFBB] lg:text-5xl">
          {safeTitle}
        </blockquote>

        <div className="mt-16 grid gap-6 text-sm leading-relaxed text-[#EFDFBB]/60 sm:grid-cols-2">
          {paragraphs.map((paragraph, index) => (
            <p key={`${paragraph.slice(0, 24)}-${index}`}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  )
}
