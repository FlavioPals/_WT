import { Plus } from 'lucide-react'
import { getAdminTeam } from '@/lib/api/team'
import { TeamManager } from './_components/TeamManager'

export const metadata = {
  title: 'Equipe',
}

export default async function DashboardEquipePage() {
  const members = await getAdminTeam()

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Equipe</p>
          <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
            Gerenciar profissionais
          </h1>
        </div>

        <div className="hidden xl:block">
          <p className="text-primary/45 text-xs">
            Clique em editar na lista para selecionar um membro
          </p>
        </div>
      </div>

      <TeamManager initialMembers={members} />
    </div>
  )
}
