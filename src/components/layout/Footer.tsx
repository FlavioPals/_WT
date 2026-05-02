import Image from 'next/image'
import Link from 'next/link'

function WhatsAppIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export function Footer() {
  return (
    <footer id="contato" className="bg-primary text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">
          {/* Logo + tagline */}
          <div>
            <div className="relative mb-6 h-8 w-52">
              <Image
                src="/logos/logo-white.png"
                alt="Studio WT Arquitetura e Design"
                fill
                sizes="208px"
                className="object-contain object-left [filter:brightness(0.72)_sepia(1)_saturate(0.7)]"
              />
            </div>
            <p className="text-[11px] tracking-[0.2em] text-[#EFDFBB]/40 uppercase">
              Arquitetura e Design
            </p>
          </div>

          {/* Contato */}
          <div className="flex flex-col gap-5 lg:items-end">
            <div className="flex flex-col gap-1.5 text-sm leading-relaxed text-[#EFDFBB]/60 lg:items-end">
              <p>São Paulo — SP</p>
              {/* TODO: substituir pelos dados reais do cliente */}
              <Link href="tel:+5511999999999" className="transition-colors hover:text-[#EFDFBB]">
                +55 (11) 99999-9999
              </Link>
              <Link
                href="mailto:contato@studiowt.com.br"
                className="transition-colors hover:text-[#EFDFBB]"
              >
                contato@studiowt.com.br
              </Link>
            </div>

            <div className="flex gap-5">
              <Link
                href="https://wa.me/5511999999999"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-[#EFDFBB]/40 transition-colors hover:text-[#EFDFBB]"
              >
                <WhatsAppIcon />
              </Link>
              <Link
                href="https://instagram.com/studiowt"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#EFDFBB]/40 transition-colors hover:text-[#EFDFBB]"
              >
                <InstagramIcon />
              </Link>
              <Link
                href="mailto:contato@studiowt.com.br"
                aria-label="Enviar e-mail"
                className="text-[#EFDFBB]/40 transition-colors hover:text-[#EFDFBB]"
              >
                <MailIcon />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-[#EFDFBB]/10 pt-6 text-[11px] tracking-wider text-[#EFDFBB]/25 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Studio WT. Todos os direitos reservados.</p>
          <p>Arquitetura e Design</p>
        </div>
      </div>
    </footer>
  )
}
