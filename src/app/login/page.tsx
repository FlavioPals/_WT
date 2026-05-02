import Image from 'next/image'
import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { LoginForm } from '@/components/auth/LoginForm'
import { getAuthUser } from '@/lib/api/auth'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Acesso administrativo do Studio WT Arquitetura e Design.',
  robots: {
    index: false,
    follow: false,
  },
}

interface LoginPageProps {
  searchParams: Promise<{
    callbackUrl?: string
  }>
}

function getCallbackUrl(callbackUrl?: string) {
  if (!callbackUrl || !callbackUrl.startsWith('/') || callbackUrl.startsWith('//')) {
    return '/dashboard'
  }

  return callbackUrl
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getAuthUser()
  const { callbackUrl } = await searchParams
  const safeCallbackUrl = getCallbackUrl(callbackUrl)

  if (user?.email) {
    redirect(safeCallbackUrl)
  }

  return (
    <main className="bg-surface grid min-h-screen lg:grid-cols-[1fr_520px]">
      <section className="bg-primary relative hidden overflow-hidden lg:block">
        <Image
          src="/logos/image/Home_ The emotional side — comfort, warmth, family_.jpg"
          alt="Interior residencial assinado pelo Studio WT"
          fill
          sizes="60vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <p className="mb-4 text-[11px] tracking-[0.22em] text-white/60 uppercase">
            Área administrativa
          </p>
          <h1 className="font-display max-w-2xl text-5xl leading-none font-light">
            Gestão editorial do portfólio Studio WT.
          </h1>
        </div>
      </section>

      <section className="flex min-h-screen items-center px-6 py-16 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          <div className="relative mb-12 h-9 w-56">
            <Image
              src="/logos/logo-dark.png"
              alt="Studio WT Arquitetura e Design"
              fill
              sizes="224px"
              className="object-contain object-left"
              priority
            />
          </div>

          <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Login</p>
          <h2 className="font-display text-primary mb-8 text-4xl leading-tight font-light">
            Entrar no painel
          </h2>

          <LoginForm callbackUrl={safeCallbackUrl} />
        </div>
      </section>
    </main>
  )
}
