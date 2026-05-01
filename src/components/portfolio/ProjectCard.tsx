'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface Project {
  id: string
  slug: string
  title: string
  year: number
  category: string
  imageUrl?: string
  gradient: string
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.div variants={cardVariants}>
      <Link
        href={`/portfolio/${project.slug}`}
        className="group relative block aspect-[4/3] overflow-hidden"
        aria-label={`Ver projeto: ${project.title}`}
      >
        {/* Image / gradient base */}
        <div className={cn('absolute inset-0', project.gradient)}>
          {project.imageUrl && (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          )}
        </div>

        {/* Hover overlay */}
        <div className="bg-primary/65 absolute inset-0 flex flex-col justify-end p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
          <p className="mb-2 text-[10px] tracking-[0.18em] text-white/55 uppercase">
            {project.category} · {project.year}
          </p>
          <h3 className="font-display text-xl leading-snug font-light text-white">
            {project.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  )
}
