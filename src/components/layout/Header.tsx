'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
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
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isHome = pathname === '/'
  const transparent = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          transparent
            ? 'bg-transparent'
            : 'border-muted border-b bg-white/95 shadow-sm backdrop-blur-sm'
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" aria-label="Studio WT — página inicial">
            <div className="relative h-7 w-44">
              <Image
                src="/logos/logo-dark.png"
                alt="Studio WT Arquitetura e Design"
                fill
                sizes="176px"
                className={cn(
                  'object-contain object-left transition-opacity duration-500',
                  transparent ? 'opacity-0' : 'opacity-100'
                )}
                priority
              />
              <Image
                src="/logos/logo-white.png"
                alt="Studio WT Arquitetura e Design"
                fill
                sizes="176px"
                className={cn(
                  'object-contain object-left transition-opacity duration-500',
                  transparent ? 'opacity-100' : 'opacity-0'
                )}
                priority
              />
            </div>
          </Link>

          <button
            onClick={() => setOpen(true)}
            aria-label="Abrir menu de navegação"
            className={cn(
              'p-1.5 transition-colors duration-300',
              transparent ? 'text-white' : 'text-primary hover:text-accent'
            )}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          showCloseButton={false}
          className="border-muted flex w-72 flex-col gap-0 border-l bg-white p-0 sm:w-80"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>

          <div className="border-muted flex h-16 shrink-0 items-center justify-between border-b px-8">
            <span className="text-muted-foreground text-[11px] tracking-[0.18em] uppercase">
              Menu
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Fechar menu"
              className="text-primary hover:text-accent transition-colors"
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
                    className="font-display text-primary hover:text-accent w-full py-3 text-left text-[1.65rem] leading-none font-light transition-colors"
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => handleNav(item.href)}
                    className="font-display text-primary hover:text-accent block py-3 text-[1.65rem] leading-none font-light transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.nav>

          <div className="mt-auto px-8 pb-10">
            <p className="text-muted-foreground text-[11px] tracking-[0.14em] uppercase">
              Studio WT · Arquitetura e Design
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
