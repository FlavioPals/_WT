import Image from 'next/image'
import type { Metadata } from 'next'
import { MemberCard } from '@/components/team/MemberCard'
import { TEAM_MEMBERS, TEAM_PHOTO } from '@/lib/team'

export const metadata: Metadata = {
  title: 'Equipe',
  description:
    'Conheça a equipe do Studio WT Arquitetura e Design, responsável por projetos residenciais, corporativos e de interiores.',
}

export default function EquipePage() {
  return (
    <div className="bg-surface min-h-screen">
      <section className="px-6 pt-32 lg:px-20 lg:pt-40">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-muted-foreground mb-4 text-[11px] tracking-[0.22em] uppercase">
                Equipe
              </p>
              <h1 className="font-display text-primary max-w-4xl text-5xl leading-none font-light lg:text-7xl">
                Pessoas que desenham espaços para outras pessoas.
              </h1>
            </div>

            <p className="text-primary/70 text-base leading-relaxed lg:text-lg">
              O Studio WT combina repertórios complementares em arquitetura, interiores e gestão de
              obra. Cada projeto nasce de uma escuta compartilhada e avança com precisão em cada
              detalhe.
            </p>
          </div>

          <div className="bg-primary relative h-[62vh] min-h-[420px] overflow-hidden lg:h-[70vh]">
            <Image
              src={TEAM_PHOTO}
              alt="Equipe do Studio WT Arquitetura e Design"
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section className="px-6 py-20 lg:px-20 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 grid gap-6 lg:grid-cols-[320px_1fr] lg:items-end">
            <p className="text-muted-foreground text-[11px] tracking-[0.22em] uppercase">
              Profissionais
            </p>
            <p className="text-primary/70 max-w-2xl text-base leading-relaxed">
              Um time enxuto, próximo e atento, organizado para acompanhar o projeto do primeiro
              encontro à entrega final.
            </p>
          </div>

          <div>
            {TEAM_MEMBERS.map((member, index) => (
              <MemberCard key={member.id} member={member} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
