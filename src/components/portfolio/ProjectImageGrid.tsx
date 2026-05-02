'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import type { ProjectImage } from '@/lib/projects'

interface Props {
  images: ProjectImage[]
  label: string
  projectTitle: string
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
}

export function ProjectImageGrid({ images, label, projectTitle }: Props) {
  const [selected, setSelected] = useState<number | null>(null)

  function prev() {
    setSelected((s) => (s === null ? null : (s - 1 + images.length) % images.length))
  }

  function next() {
    setSelected((s) => (s === null ? null : (s + 1) % images.length))
  }

  if (images.length === 0) return null

  return (
    <div>
      <p className="mb-6 text-[11px] tracking-[0.22em] text-[#EFDFBB]/45 uppercase">{label}</p>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {images.map((image, index) => (
          <motion.button
            key={image.id}
            variants={item}
            type="button"
            onClick={() => setSelected(index)}
            className="group relative aspect-[4/3] overflow-hidden bg-[#1a1f27] outline-none focus-visible:ring-2 focus-visible:ring-[#EFDFBB]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#222933]"
            aria-label={`Ampliar: ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-all duration-700 group-hover:scale-105"
              quality={80}
            />
            <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/30" />
            <span className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="border border-[#EFDFBB]/40 bg-[#222933]/60 px-4 py-1.5 text-[10px] tracking-[0.18em] text-[#EFDFBB] uppercase backdrop-blur-sm">
                Ver
              </span>
            </span>
          </motion.button>
        ))}
      </motion.div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent
          showCloseButton
          className="max-w-[calc(100vw-2rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">
            {label} — {projectTitle}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Use as setas para navegar entre as imagens.
          </DialogDescription>

          {selected !== null && (
            <div className="relative bg-[#1a1f27]">
              <div className="relative h-[70vh] max-h-[720px] min-h-[280px] w-full">
                <Image
                  src={images[selected].src}
                  alt={images[selected].alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  quality={90}
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Imagem anterior"
                    className="absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center bg-[#222933]/80 text-[#EFDFBB] transition-colors hover:bg-[#222933]"
                  >
                    <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <button
                    onClick={next}
                    aria-label="Próxima imagem"
                    className="absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center bg-[#222933]/80 text-[#EFDFBB] transition-colors hover:bg-[#222933]"
                  >
                    <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </>
              )}

              <div className="flex items-center justify-between px-4 py-3">
                <p className="text-[11px] tracking-[0.16em] text-[#EFDFBB]/55 uppercase">
                  {images[selected].alt}
                </p>
                <p className="text-[11px] tracking-[0.14em] text-[#EFDFBB]/40">
                  {selected + 1} / {images.length}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
