'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'

const navItems = [
  { label: 'Sobre', href: '/sobre' },
  { label: 'Portfólio', href: '/portfolio' },
  { label: 'Equipe', href: '/equipe' },
  { label: 'Contato', href: '#contato' },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.08 } },
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1]

const itemVariant = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: { ease: EASE, duration: 0.45 } },
}

export function Header() {
  const [open, setOpen] = useState(false)

  function handleNav(href: string) {
    setOpen(false)
    if (href.startsWith('#')) {
      setTimeout(() => {
        document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' })
      }, 280)
    }
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#222933]/95 backdrop-blur-sm transition-all duration-500">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" aria-label="Studio WT — página inicial">
            <div className="relative h-7 w-44">
              <Image
                src="/logos/logo-white.png"
                alt="Studio WT Arquitetura e Design"
                fill
                sizes="176px"
                className="object-contain object-left [filter:brightness(0.72)_sepia(1)_saturate(0.7)]"
                priority
              />
            </div>
          </Link>

          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu de navegação"
            className="cursor-pointer rounded-sm p-1.5 text-[#EFDFBB]/70 transition-all duration-300 outline-none hover:text-[#EFDFBB] focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-4"
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="bg-foreground border-primary/10 flex w-72 flex-col gap-0 border-l p-0 sm:w-80"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>

          <div className="border-primary/10 flex h-16 shrink-0 items-center justify-between border-b px-8">
            <span className="text-primary/50 text-[11px] tracking-[0.18em] uppercase">Menu</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="text-primary/70 hover:text-primary focus-visible:ring-primary/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-4"
            >
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <motion.nav
            variants={stagger}
            initial="hidden"
            animate="show"
            className="flex flex-col px-8 pt-10 pb-6"
            aria-label="Navegação principal"
          >
            {navItems.map((item) => (
              <motion.div key={item.label} variants={itemVariant}>
                {item.href.startsWith('#') ? (
                  <button
                    onClick={() => handleNav(item.href)}
                    className="font-display text-primary/85 hover:text-primary focus-visible:text-primary w-full py-3 text-left text-[1.65rem] leading-none font-bold transition-colors outline-none"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => handleNav(item.href)}
                    className="font-display text-primary/85 hover:text-primary focus-visible:text-primary block py-3 text-[1.65rem] leading-none font-bold transition-colors outline-none"
                  >
                    {item.label}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.nav>

          <div className="mt-auto px-8 pb-10">
            <p className="text-primary/40 text-[11px] tracking-[0.14em] uppercase">
              Studio WT · Arquitetura e Design
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
