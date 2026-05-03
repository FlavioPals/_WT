import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getAuthUser } from '@/lib/api/auth'
import { ProfilePasswordForm } from './_components/ProfilePasswordForm'

export const metadata = {
  title: 'Meu Perfil',
}

export default async function DashboardPerfilPage() {
  const user = await getAuthUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="text-primary/55 mb-8 text-sm">Meu Perfil</p>
          <h1 className="text-primary text-3xl leading-tight font-medium">Meu Perfil</h1>
        </div>

        <Link
          href="/dashboard"
          className="bg-primary hover:bg-accent inline-flex h-10 items-center gap-2 px-4 text-sm font-medium text-white transition-colors"
        >
          <ArrowLeft size={16} strokeWidth={1.8} aria-hidden="true" />
          Voltar
        </Link>
      </div>

      <section className="mb-6 rounded-lg bg-white p-7 shadow-[0_16px_36px_rgba(34,41,51,0.08)]">
        <p className="text-primary/45 mb-4 text-[11px] font-semibold tracking-[0.28em] uppercase">
          Informacoes da conta
        </p>

        <h2 className="text-primary mb-5 text-3xl font-semibold">{user.name}</h2>
        <p className="text-primary/65 mb-8 max-w-4xl text-base leading-relaxed">
          Seus dados basicos ficam visiveis aqui para referencia rapida. A edicao desta tela e
          focada somente na troca segura da sua senha.
        </p>

        <dl className="grid gap-6 md:grid-cols-2">
          <div>
            <dt className="text-primary mb-2 text-sm font-semibold">Nome</dt>
            <dd className="text-primary/80 text-sm">{user.name}</dd>
          </div>
          <div>
            <dt className="text-primary mb-2 text-sm font-semibold">E-mail</dt>
            <dd className="text-primary/80 text-sm">{user.email}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-lg bg-white p-7 shadow-[0_16px_36px_rgba(34,41,51,0.08)]">
        <p className="border-primary/25 text-primary mb-8 border-b pb-3 text-[11px] uppercase">
          Alterar senha
        </p>
        <ProfilePasswordForm />
      </section>
    </div>
  )
}
