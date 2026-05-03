import Image from 'next/image'
import Link from 'next/link'
import { getSiteContent, getSiteContentValue } from '@/lib/api/site'
import { ContactForm } from './ContactForm'

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

function phoneHref(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits ? `tel:+${digits}` : 'tel:+5511999999999'
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : 'https://wa.me/5511999999999'
}

export async function Footer() {
  const contents = await getSiteContent({ group: 'contact' })
  const phone = getSiteContentValue(contents, 'contact_phone', '+55 (11) 99999-9999')
  const email = getSiteContentValue(contents, 'contact_email', 'contato@studiowt.com.br')
  const city = getSiteContentValue(contents, 'contact_city', 'Sao Paulo - SP')
  const instagram = getSiteContentValue(
    contents,
    'contact_instagram',
    'https://instagram.com/studiowt'
  )

  return (
    <footer id="contato" className="bg-foreground text-primary">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.8fr)] lg:items-start">
          <div className="flex flex-col gap-6">
            <div>
              <div className="relative mb-4 h-8 w-52">
                <Image
                  src="/logos/logo-dark.png"
                  alt="Studio WT Arquitetura e Design"
                  fill
                  sizes="208px"
                  className="object-contain object-left"
                />
              </div>
              <p className="text-primary/40 text-[11px] tracking-[0.2em] uppercase">
                Arquitetura e Design
              </p>
            </div>

            <div className="flex flex-col gap-5">
              <div className="text-primary/60 flex flex-col gap-1.5 text-sm leading-relaxed">
                <p>{city}</p>
                <Link href={phoneHref(phone)} className="hover:text-primary transition-colors">
                  {phone}
                </Link>
                <Link href={`mailto:${email}`} className="hover:text-primary transition-colors">
                  {email}
                </Link>
              </div>

              <div className="flex gap-5">
                <Link
                  href={whatsappHref(phone)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="text-primary/40 hover:text-primary transition-colors"
                >
                  <WhatsAppIcon />
                </Link>
                <Link
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="text-primary/40 hover:text-primary transition-colors"
                >
                  <InstagramIcon />
                </Link>
                <Link
                  href={`mailto:${email}`}
                  aria-label="Enviar e-mail"
                  className="text-primary/40 hover:text-primary transition-colors"
                >
                  <MailIcon />
                </Link>
              </div>
            </div>
          </div>

          <ContactForm />
        </div>

        <div className="border-primary/10 text-primary/25 mt-10 flex flex-col gap-2 border-t pt-4 text-[11px] tracking-wider sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Studio WT. Todos os direitos reservados.</p>
          <p>Arquitetura e Design</p>
        </div>
      </div>
    </footer>
  )
}
