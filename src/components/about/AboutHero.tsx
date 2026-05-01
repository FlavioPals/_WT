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

const areas = ['Residencial', 'Corporativo', 'Interiores', 'Retrofit']

// TODO: replace with SiteContent from DB (key: 'about_text')
const ABOUT_PARAGRAPHS = [
  'O Studio WT nasce da convicção de que a arquitetura é, antes de tudo, escuta. Cada projeto começa com uma conversa profunda sobre como as pessoas habitam, trabalham e se relacionam com o espaço.',
  'Fundado em São Paulo, o escritório reúne arquitetos e designers com formações complementares, unidos por uma estética que valoriza materiais naturais, luz generosa e planta livre. Trabalhamos em projetos residenciais e corporativos de pequena a grande escala.',
  'Nossa metodologia é colaborativa: o cliente participa ativamente de cada etapa — do conceito à entrega das chaves. Acreditamos que o melhor resultado surge quando quem vai viver o espaço ajuda a imaginá-lo.',
]

export function AboutHero() {
  return (
    <section className="bg-surface min-h-screen px-6 pt-32 pb-24 lg:px-20 lg:pt-40 lg:pb-32">
      <div className="mx-auto max-w-7xl">
        {/* Label */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="text-muted-foreground mb-16 text-[11px] tracking-[0.22em] uppercase"
        >
          Sobre o escritório
        </motion.p>

        {/* Two-column layout */}
        <div className="flex flex-col gap-16 lg:flex-row lg:gap-24">
          {/* Left — logo */}
          <motion.div
            variants={fadeUp}
            custom={0.05}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="lg:sticky lg:top-32 lg:w-2/5 lg:self-start"
          >
            <div className="relative h-14 w-64 lg:h-20 lg:w-80">
              <Image
                src="/logos/logo-dark.png"
                alt="Studio WT Arquitetura e Design"
                fill
                sizes="(max-width: 1024px) 256px, 320px"
                className="object-contain object-left"
                priority
              />
            </div>

            <p className="text-muted-foreground mt-8 text-[11px] tracking-[0.2em] uppercase">
              São Paulo — SP
            </p>
          </motion.div>

          {/* Right — content */}
          <div className="flex flex-col gap-12 lg:w-3/5">
            {/* Areas of practice */}
            <motion.div
              variants={fadeUp}
              custom={0.1}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
            >
              <p className="text-muted-foreground mb-4 text-[11px] tracking-[0.18em] uppercase">
                Áreas de atuação
              </p>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <span
                    key={area}
                    className="border-muted text-primary rounded-full border px-4 py-1.5 text-xs tracking-wide"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Text paragraphs */}
            <div className="flex flex-col gap-6">
              {ABOUT_PARAGRAPHS.map((paragraph, i) => (
                <motion.p
                  key={i}
                  variants={fadeUp}
                  custom={0.15 + i * 0.08}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  className="text-primary/80 text-base leading-relaxed lg:text-lg"
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
              className="border-muted grid grid-cols-3 gap-8 border-t pt-10"
            >
              {[
                { value: '2015', label: 'Fundação' },
                { value: '+80', label: 'Projetos' },
                { value: '6', label: 'Profissionais' },
              ].map(({ value, label }) => (
                <div key={label}>
                  <p className="font-display text-primary text-3xl font-light lg:text-4xl">
                    {value}
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px] tracking-[0.16em] uppercase">
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
