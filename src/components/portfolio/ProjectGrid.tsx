'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Project } from '@/lib/projects'
import { ProjectCard, cardVariants } from './ProjectCard'

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const ALL = 'Todos'

interface Props {
  projects: Project[]
  categories: string[]
}

export function ProjectGrid({ projects, categories }: Props) {
  const [active, setActive] = useState(ALL)

  const filtered = active === ALL ? projects : projects.filter((p) => p.category === active)
  const tabs = [ALL, ...categories]

  return (
    <div>
      {/* Filter chips */}
      <div className="mb-12 flex flex-wrap gap-2">
        {tabs.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            aria-pressed={active === cat}
            className={cn(
              'rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#EFDFBB] focus-visible:ring-offset-2',
              active === cat
                ? 'border-[#EFDFBB] bg-[#EFDFBB] text-[#222933]'
                : 'border-[#EFDFBB]/25 text-[#EFDFBB]/70 hover:border-[#EFDFBB]/60'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid — key on active re-triggers stagger when filter changes */}
      <motion.div
        key={active}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {filtered.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </motion.div>

      {filtered.length === 0 && (
        <motion.p
          variants={cardVariants}
          initial="hidden"
          animate="show"
          className="py-24 text-center text-sm text-[#EFDFBB]/50"
        >
          Nenhum projeto nesta categoria ainda.
        </motion.p>
      )}
    </div>
  )
}
