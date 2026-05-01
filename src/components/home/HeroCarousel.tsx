'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface HeroSlide {
  id: string
  title: string
  imageUrl: string
  /** Tailwind gradient fallback while image loads */
  gradient?: string
}

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1]
const INTERVAL_MS = 3000

interface Props {
  slides: HeroSlide[]
}

export function HeroCarousel({ slides }: Props) {
  const [current, setCurrent] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function advance() {
    setCurrent((c) => (c + 1) % slides.length)
  }

  function goTo(index: number) {
    setCurrent(index)
    restartInterval()
  }

  function restartInterval() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(advance, INTERVAL_MS)
  }

  useEffect(() => {
    if (!paused) {
      intervalRef.current = setInterval(advance, INTERVAL_MS)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, slides.length])

  return (
    <section
      className="relative h-screen w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Destaque de projetos"
    >
      {/* All slides pre-rendered; only opacity animated to avoid next/image remount issues */}
      <div className="absolute inset-0">
        {slides.map((s, i) => (
          <motion.div
            key={s.id}
            animate={{ opacity: i === current ? 1 : 0 }}
            transition={{ duration: 1.2, ease: EASE }}
            className={cn('absolute inset-0', s.gradient)}
          >
            <Image
              src={s.imageUrl}
              alt={s.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority={i === 0}
            />
          </motion.div>
        ))}
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Dot indicators */}
      <div
        className="absolute right-6 bottom-10 flex gap-2 lg:right-20"
        role="tablist"
        aria-label="Selecionar projeto"
      >
        {slides.map((s, i) => (
          <button
            key={s.id}
            role="tab"
            aria-selected={i === current}
            aria-label={`Projeto ${i + 1}: ${s.title}`}
            onClick={() => goTo(i)}
            className={cn(
              'h-[3px] transition-all duration-500',
              i === current ? 'w-8 bg-white' : 'w-3 bg-white/35 hover:bg-white/60'
            )}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!paused && (
        <motion.div
          key={current + '-progress'}
          className="absolute bottom-0 left-0 h-[2px] bg-white/40"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: INTERVAL_MS / 1000, ease: 'linear' }}
        />
      )}
    </section>
  )
}
