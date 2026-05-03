'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE, delay },
  }),
}

const DEFAULT_AREAS = ['Residencial', 'Corporativo', 'Interiores', 'Retrofit']

const ABOUT_PARAGRAPHS = [
  'O Studio WT nasce da convicção de que a arquitetura é, antes de tudo, escuta. Cada projeto começa com uma conversa profunda sobre como as pessoas habitam, trabalham e se relacionam com o espaço.',
  'Fundado em São Paulo, o escritório reúne arquitetos e designers com formações complementares, unidos por uma estética que valoriza materiais naturais, luz generosa e planta livre. Trabalhamos em projetos residenciais e corporativos de pequena a grande escala.',
  'Nossa metodologia é colaborativa: o cliente participa ativamente de cada etapa — do conceito à entrega das chaves. Acreditamos que o melhor resultado surge quando quem vai viver o espaço ajuda a imaginá-lo.',
]

interface AboutHeroProps {
  areas?: string[]
  paragraphs?: string[]
  founded?: string
  projects?: string
  team?: string
}

export function AboutHero({
  areas = DEFAULT_AREAS,
  paragraphs = ABOUT_PARAGRAPHS,
  founded = '2022',
  projects = '+80',
  team = '3',
}: AboutHeroProps) {
  return (
    <section className="min-h-screen px-6 pt-32 pb-24 lg:px-20 lg:pt-40 lg:pb-32">
      <div className="mx-auto max-w-7xl">
        {/* Label */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-16 text-[11px] tracking-[0.22em] text-[#EFDFBB]/50 uppercase"
        >
          Sobre o escritório
        </motion.p>

        {/* Two-column layout */}
        <div className="flex flex-col gap-0 overflow-hidden rounded-sm bg-[#EFDFBB]/5 lg:flex-row">
          {/* Left — logo */}
          <motion.div
            variants={fadeUp}
            custom={0.05}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center px-10 py-12 lg:sticky lg:top-32 lg:w-2/5 lg:self-start"
          >
            <div className="relative w-full" style={{ aspectRatio: '1.27 / 1' }}>
              <Image
                src="/logos/logo-wt-symbol.png"
                alt="Studio WT"
                fill
                sizes="(max-width: 1024px) 80vw, 40vw"
                className="object-contain object-center [filter:invert(1)_brightness(0.72)_sepia(1)_saturate(0.7)]"
                priority
              />
            </div>

            <p className="mt-6 text-[11px] tracking-[0.2em] text-[#EFDFBB]/50 uppercase">
              Castro - Paraná
            </p>
          </motion.div>

          {/* Right — content */}
          <div className="flex flex-col gap-12 px-10 py-12 lg:w-3/5">
            {/* Areas of practice */}
            <motion.div
              variants={fadeUp}
              custom={0.1}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="mb-4 text-[11px] tracking-[0.18em] text-[#EFDFBB]/50 uppercase">
                Áreas de atuação
              </p>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <span
                    key={area}
                    className="rounded-full border border-[#EFDFBB]/25 px-4 py-1.5 text-xs tracking-wide text-[#EFDFBB]/80"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Text paragraphs */}
            <div className="flex flex-col gap-6">
              {paragraphs.map((paragraph, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  custom={0.15 + i * 0.08}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="text-base leading-relaxed text-[#EFDFBB]/75 lg:text-lg"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              custom={0.35}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-3 gap-8 border-t border-[#EFDFBB]/15 pt-10"
            >
              {[
                { value: founded, label: 'Fundação' },
                { value: projects, label: 'Projetos' },
                { value: team, label: 'Profissionais' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl font-light text-[#EFDFBB] lg:text-4xl">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] tracking-[0.16em] text-[#EFDFBB]/50 uppercase">
                    {label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
