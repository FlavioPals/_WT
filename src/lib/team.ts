export interface TeamMember {
  id: string
  name: string
  role: string
  bio: string
  photoUrl: string
}

export const TEAM_PHOTO = '/logos/foto_equipe.jpg'

// TODO: replace with db.teamMember.findMany({ orderBy: { order: 'asc' } })
export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'ana-watanabe',
    name: 'Ana Watanabe',
    role: 'Arquiteta fundadora',
    photoUrl: TEAM_PHOTO,
    bio: 'Conduz a direção criativa do escritório, com atenção especial à implantação, proporção e materialidade. Seu trabalho aproxima rigor técnico e escuta sensível para transformar necessidades complexas em espaços calmos e precisos.',
  },
  {
    id: 'thais-moreno',
    name: 'Thaís Moreno',
    role: 'Arquiteta coordenadora',
    photoUrl: TEAM_PHOTO,
    bio: 'Coordena projetos residenciais e corporativos, articulando conceito, compatibilização e acompanhamento de obra. Tem olhar apurado para detalhes construtivos e para a experiência cotidiana de quem ocupa cada ambiente.',
  },
  {
    id: 'renato-campos',
    name: 'Renato Campos',
    role: 'Designer de interiores',
    photoUrl: TEAM_PHOTO,
    bio: 'Desenvolve interiores, mobiliário e curadoria de materiais com foco em conforto visual, textura e permanência. Seu processo busca soluções discretas, funcionais e alinhadas à identidade de cada cliente.',
  },
]
