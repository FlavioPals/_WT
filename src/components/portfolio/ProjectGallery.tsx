'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ProjectImage } from '@/lib/projects'

interface ProjectGalleryProps {
  images: ProjectImage[]
  title: string
}

export function ProjectGallery({ images, title }: ProjectGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const selectedImage = selectedIndex === null ? null : images[selectedIndex]

  function showPrevious() {
    setSelectedIndex((current) =>
      current === null ? null : (current - 1 + images.length) % images.length
    )
  }

  function showNext() {
    setSelectedIndex((current) => (current === null ? null : (current + 1) % images.length))
  }

  if (images.length === 0) {
    return null
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
        {images.map((image, index) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className={cn(
              'group bg-primary relative block overflow-hidden text-left',
              index === 0 && images.length > 2
                ? 'aspect-[4/3] md:col-span-4 md:row-span-2'
                : 'aspect-[4/3] md:col-span-2'
            )}
            aria-label={`Ampliar imagem: ${image.alt}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes={
                index === 0 ? '(max-width: 768px) 100vw, 66vw' : '(max-width: 768px) 100vw, 33vw'
              }
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            <span className="text-primary absolute right-4 bottom-4 grid size-9 place-items-center bg-white/90 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Expand size={16} strokeWidth={1.5} aria-hidden="true" />
            </span>
          </button>
        ))}
      </div>

      <Dialog
        open={selectedIndex !== null}
        onOpenChange={(open) => !open && setSelectedIndex(null)}
      >
        <DialogContent
          showCloseButton
          className="max-w-[calc(100vw-2rem)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-6xl"
        >
          <DialogTitle className="sr-only">Galeria do projeto {title}</DialogTitle>
          <DialogDescription className="sr-only">
            Use os botões para navegar entre as imagens ampliadas.
          </DialogDescription>

          {selectedImage && (
            <div className="bg-primary relative overflow-hidden">
              <div className="relative h-[72vh] max-h-[780px] min-h-[320px] w-[min(1120px,calc(100vw-2rem))]">
                <Image
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={showPrevious}
                    aria-label="Imagem anterior"
                    className="text-primary absolute top-1/2 left-3 grid size-10 -translate-y-1/2 place-items-center bg-white/90 transition-colors hover:bg-white"
                  >
                    <ChevronLeft size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={showNext}
                    aria-label="Próxima imagem"
                    className="text-primary absolute top-1/2 right-3 grid size-10 -translate-y-1/2 place-items-center bg-white/90 transition-colors hover:bg-white"
                  >
                    <ChevronRight size={20} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </>
              )}

              <p className="bg-primary/80 absolute bottom-4 left-4 px-3 py-2 text-[11px] tracking-[0.14em] text-white/80 uppercase backdrop-blur-sm">
                {selectedIndex === null ? 0 : selectedIndex + 1} / {images.length}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
