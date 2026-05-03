import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/api/auth'
import { getAdminUsers } from '@/lib/api/users'
import { UserManager } from './_components/UserManager'

export const metadata = {
  title: 'Usuarios',
}

export default async function DashboardUsuariosPage() {
  const currentUser = await getAuthUser()

  if (!currentUser) {
    redirect('/login')
  }

  if (currentUser.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { data: users } = await getAdminUsers({
    limit: 100,
    sort: 'createdAt',
    direction: 'desc',
  })

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Usuarios</p>
          <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
            Gerenciar acessos
          </h1>
        </div>

        <p className="text-primary/45 hidden text-xs xl:block">
          Controle administradores e arquitetos do painel
        </p>
      </div>

      <UserManager initialUsers={users} currentUser={currentUser} />
    </div>
  )
}
