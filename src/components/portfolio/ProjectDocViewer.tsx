'use client'

import Image from 'next/image'
import { useState, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProjectImage } from '@/lib/projects'

interface Props {
  images: ProjectImage[]
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const TYPE_LABEL: Record<string, string> = {
  technical: 'Técnica',
  artistic: 'Artística',
}

export function ProjectDocViewer({ images }: Props) {
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

  const img = images[current]

  return (
    <div className="flex flex-col items-center">
      {/* Viewer centralizado com setas externas */}
      <div className="flex w-full max-w-4xl items-center gap-4 lg:gap-6">
        {/* Seta esquerda */}
        <button
          onClick={prev}
          aria-label="Imagem anterior"
          disabled={images.length <= 1}
          className="grid size-9 shrink-0 place-items-center border border-[#EFDFBB]/20 text-[#EFDFBB]/50 transition-all duration-300 hover:border-[#EFDFBB]/50 hover:text-[#EFDFBB] disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>

        {/* Imagem central */}
        <div className="relative min-w-0 flex-1 overflow-hidden bg-[#1a1f27]">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative aspect-[4/3] w-full"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                sizes="(max-width: 1024px) 80vw, 60vw"
                className="object-cover"
                quality={85}
              />

              {/* Badge do tipo */}
              {img.type !== 'gallery' && (
                <span className="absolute top-3 left-3 bg-[#222933]/70 px-2.5 py-1 text-[9px] tracking-[0.2em] text-[#EFDFBB]/70 uppercase backdrop-blur-sm">
                  {TYPE_LABEL[img.type] ?? img.type}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Seta direita */}
        <button
          onClick={next}
          aria-label="Próxima imagem"
          disabled={images.length <= 1}
          className="grid size-9 shrink-0 place-items-center border border-[#EFDFBB]/20 text-[#EFDFBB]/50 transition-all duration-300 hover:border-[#EFDFBB]/50 hover:text-[#EFDFBB] disabled:pointer-events-none disabled:opacity-20"
        >
          <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      {/* Legenda e contador */}
      <div className="mt-4 flex w-full max-w-4xl items-center justify-between px-[52px]">
        <p className="truncate text-xs text-[#EFDFBB]/45">{img.alt}</p>
        <p className="shrink-0 pl-4 text-[10px] tracking-[0.18em] text-[#EFDFBB]/35">
          {String(current + 1).padStart(2, '0')}
          <span className="mx-1 opacity-50">/</span>
          {String(images.length).padStart(2, '0')}
        </p>
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div className="mt-5 flex gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Imagem ${i + 1}`}
              className={`h-[2px] transition-all duration-500 ${
                i === current ? 'w-6 bg-[#EFDFBB]' : 'w-2.5 bg-[#EFDFBB]/25 hover:bg-[#EFDFBB]/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
