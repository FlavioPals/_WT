'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectImage } from '@/lib/projects'

interface Props {
  images: ProjectImage[]
  title: string
  location: string
  year: number
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

export function ProjectCarousel({ images, title, location, year }: Props) {
  const [current, setCurrent] = useState(0)

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length)
  }, [images.length])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length)
  }, [images.length])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  if (images.length === 0) return null

  return (
    <section aria-label="Galeria principal do projeto" className="px-6 py-8 lg:px-20">
      <div className="mx-auto flex flex-col items-center">
        {/* Imagem — mesmo tamanho do DocViewer */}
        <div className="relative w-full max-w-4xl overflow-hidden bg-[#1a1f27]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="relative aspect-[4/3] w-full"
            >
              <Image
                src={images[current].src}
                alt={images[current].alt}
                fill
                sizes="(max-width: 1024px) 90vw, 56vw"
                className="object-cover"
                quality={90}
                priority={current === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Setas de navegação */}
          {images.length > 1 && (
            <>
              <button
                onClick={prev}
                aria-label="Foto anterior"
                className="absolute top-1/2 left-3 z-10 grid size-9 -translate-y-1/2 place-items-center border border-[#EFDFBB]/20 bg-[#222933]/55 text-[#EFDFBB] backdrop-blur-sm transition-all duration-300 hover:border-[#EFDFBB]/50 hover:bg-[#222933]/80"
              >
                <ChevronLeft size={17} strokeWidth={1.5} aria-hidden="true" />
              </button>
              <button
                onClick={next}
                aria-label="Próxima foto"
                className="absolute top-1/2 right-3 z-10 grid size-9 -translate-y-1/2 place-items-center border border-[#EFDFBB]/20 bg-[#222933]/55 text-[#EFDFBB] backdrop-blur-sm transition-all duration-300 hover:border-[#EFDFBB]/50 hover:bg-[#222933]/80"
              >
                <ChevronRight size={17} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </>
          )}

          {/* Contador */}
          <p className="absolute right-3 bottom-3 z-10 text-[10px] tracking-[0.2em] text-[#EFDFBB]/55 uppercase">
            {String(current + 1).padStart(2, '0')}
            <span className="mx-1 opacity-30">/</span>
            {String(images.length).padStart(2, '0')}
          </p>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3.5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Foto ${i + 1}`}
                  className={`h-[2px] transition-all duration-500 ${
                    i === current
                      ? 'w-6 bg-[#EFDFBB]'
                      : 'w-2.5 bg-[#EFDFBB]/30 hover:bg-[#EFDFBB]/55'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info abaixo */}
        <div className="mt-4 flex w-full max-w-4xl flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
          <h2 className="font-display text-lg font-light text-[#EFDFBB] lg:text-xl">{title}</h2>
          <p className="text-xs tracking-wide text-[#EFDFBB]/45">
            {location}
            <span className="mx-2 opacity-40">·</span>
            {year}
          </p>
        </div>
      </div>
    </section>
  )
}
