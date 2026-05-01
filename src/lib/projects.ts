export interface ProjectImage {
  id: string
  src: string
  alt: string
}

export interface Project {
  id: string
  slug: string
  title: string
  year: number
  category: string
  location: string
  area: string
  gradient: string
  imageUrl?: string
  description: string[]
  images: ProjectImage[]
}

const imagePool = {
  living: '/logos/image/download.jpg',
  lounge: '/logos/image/download (1).jpg',
  launch: '/logos/image/CreativeRender _ Soluções completas para lançamentos imobiliários.jpg',
  home: '/logos/image/Home_ The emotional side — comfort, warmth, family_.jpg',
}

export const PROJECTS: Project[] = [
  {
    id: '1',
    slug: 'casa-itaim',
    title: 'Casa Itaim',
    year: 2024,
    category: 'Residencial',
    location: 'Itaim Bibi, São Paulo',
    area: '420 m²',
    imageUrl: imagePool.living,
    gradient: 'bg-gradient-to-br from-stone-700 via-stone-800 to-neutral-900',
    description: [
      'Residência urbana pensada para receber com naturalidade, aproximando áreas sociais, jardim e cozinha em uma sequência contínua de luz e materiais quentes.',
      'A proposta equilibra volumes precisos com texturas naturais, criando ambientes silenciosos, generosos e flexíveis para a rotina de uma família em transformação.',
    ],
    images: [
      { id: 'casa-itaim-01', src: imagePool.living, alt: 'Sala integrada da Casa Itaim' },
      { id: 'casa-itaim-02', src: imagePool.home, alt: 'Estar com luz natural da Casa Itaim' },
      { id: 'casa-itaim-03', src: imagePool.lounge, alt: 'Área social da Casa Itaim' },
      { id: 'casa-itaim-04', src: imagePool.launch, alt: 'Vista interna da Casa Itaim' },
    ],
  },
  {
    id: '2',
    slug: 'escritorio-faria-lima',
    title: 'Escritório Faria Lima',
    year: 2023,
    category: 'Corporativo',
    location: 'Faria Lima, São Paulo',
    area: '680 m²',
    imageUrl: imagePool.lounge,
    gradient: 'bg-gradient-to-br from-neutral-600 via-zinc-700 to-stone-900',
    description: [
      'Escritório corporativo com áreas abertas, salas de reunião transparentes e pontos de pausa distribuídos para apoiar diferentes ritmos de trabalho.',
      'O desenho privilegia percursos claros, iluminação confortável e uma materialidade sóbria, mantendo o ambiente elegante sem perder eficiência operacional.',
    ],
    images: [
      {
        id: 'faria-lima-01',
        src: imagePool.lounge,
        alt: 'Ambiente corporativo do Escritório Faria Lima',
      },
      {
        id: 'faria-lima-02',
        src: imagePool.launch,
        alt: 'Área de reunião do Escritório Faria Lima',
      },
      { id: 'faria-lima-03', src: imagePool.living, alt: 'Lounge do Escritório Faria Lima' },
      {
        id: 'faria-lima-04',
        src: imagePool.home,
        alt: 'Espaço de convivência do Escritório Faria Lima',
      },
    ],
  },
  {
    id: '3',
    slug: 'cobertura-higienopolis',
    title: 'Cobertura Higienópolis',
    year: 2023,
    category: 'Residencial',
    location: 'Higienópolis, São Paulo',
    area: '310 m²',
    imageUrl: imagePool.launch,
    gradient: 'bg-gradient-to-br from-stone-500 via-neutral-700 to-zinc-900',
    description: [
      'Reforma de cobertura com foco na abertura das vistas, integração da área gourmet e criação de uma paleta que combina madeira, pedra e tons claros.',
      'A intervenção reorganiza fluxos e amplia a sensação de permanência, com ambientes que transitam entre intimidade e celebração.',
    ],
    images: [
      {
        id: 'higienopolis-01',
        src: imagePool.launch,
        alt: 'Ambiente principal da Cobertura Higienópolis',
      },
      { id: 'higienopolis-02', src: imagePool.home, alt: 'Área social da Cobertura Higienópolis' },
      {
        id: 'higienopolis-03',
        src: imagePool.living,
        alt: 'Detalhe de interiores da Cobertura Higienópolis',
      },
      { id: 'higienopolis-04', src: imagePool.lounge, alt: 'Estar da Cobertura Higienópolis' },
    ],
  },
  {
    id: '4',
    slug: 'casa-campos',
    title: 'Casa Campos do Jordão',
    year: 2022,
    category: 'Residencial',
    location: 'Campos do Jordão, SP',
    area: '560 m²',
    imageUrl: imagePool.home,
    gradient: 'bg-gradient-to-br from-emerald-900 via-stone-800 to-neutral-900',
    description: [
      'Casa de fim de semana desenhada para desacelerar, com volumes baixos, lareira central e grandes aberturas orientadas para a paisagem.',
      'A arquitetura busca uma presença discreta no terreno, usando materiais táteis e uma implantação que acompanha a topografia natural.',
    ],
    images: [
      { id: 'campos-01', src: imagePool.home, alt: 'Sala acolhedora da Casa Campos do Jordão' },
      { id: 'campos-02', src: imagePool.living, alt: 'Estar da Casa Campos do Jordão' },
      { id: 'campos-03', src: imagePool.launch, alt: 'Vista interna da Casa Campos do Jordão' },
      { id: 'campos-04', src: imagePool.lounge, alt: 'Área social da Casa Campos do Jordão' },
    ],
  },
  {
    id: '5',
    slug: 'loja-oscar-freire',
    title: 'Loja Oscar Freire',
    year: 2024,
    category: 'Corporativo',
    location: 'Oscar Freire, São Paulo',
    area: '180 m²',
    gradient: 'bg-gradient-to-br from-zinc-600 via-slate-700 to-stone-900',
    description: [
      'Projeto comercial com vitrine transparente, percurso intuitivo e mobiliário sob medida para valorizar produtos sem competir com eles.',
      'A loja trabalha com contrastes de textura e iluminação precisa, criando uma experiência de compra calma, sofisticada e memorável.',
    ],
    images: [
      { id: 'oscar-freire-01', src: imagePool.launch, alt: 'Interior da Loja Oscar Freire' },
      { id: 'oscar-freire-02', src: imagePool.lounge, alt: 'Área expositiva da Loja Oscar Freire' },
      {
        id: 'oscar-freire-03',
        src: imagePool.living,
        alt: 'Detalhe de mobiliário da Loja Oscar Freire',
      },
    ],
  },
  {
    id: '6',
    slug: 'apartamento-brooklin',
    title: 'Apartamento Brooklin',
    year: 2023,
    category: 'Interiores',
    location: 'Brooklin, São Paulo',
    area: '145 m²',
    gradient: 'bg-gradient-to-br from-stone-400 via-stone-600 to-zinc-800',
    description: [
      'Interiores para um apartamento compacto, com marcenaria contínua, iluminação indireta e integração entre jantar, estar e varanda.',
      'A solução valoriza armazenamento sem pesar visualmente, criando uma base neutra para objetos, arte e vida cotidiana.',
    ],
    images: [
      { id: 'brooklin-01', src: imagePool.living, alt: 'Sala do Apartamento Brooklin' },
      { id: 'brooklin-02', src: imagePool.home, alt: 'Estar do Apartamento Brooklin' },
      {
        id: 'brooklin-03',
        src: imagePool.lounge,
        alt: 'Detalhe de interiores do Apartamento Brooklin',
      },
    ],
  },
  {
    id: '7',
    slug: 'escritorio-vila-olimpia',
    title: 'Escritório Vila Olímpia',
    year: 2022,
    category: 'Retrofit',
    location: 'Vila Olímpia, São Paulo',
    area: '520 m²',
    gradient: 'bg-gradient-to-br from-neutral-500 via-neutral-700 to-stone-900',
    description: [
      'Retrofit de laje corporativa com atualização de infraestrutura, revisão de layout e novas áreas de encontro para uma equipe híbrida.',
      'A intervenção mantém a estrutura existente como premissa, reduzindo desperdícios e trazendo uma linguagem mais leve ao espaço.',
    ],
    images: [
      {
        id: 'vila-olimpia-01',
        src: imagePool.lounge,
        alt: 'Área de trabalho do Escritório Vila Olímpia',
      },
      {
        id: 'vila-olimpia-02',
        src: imagePool.launch,
        alt: 'Sala de reunião do Escritório Vila Olímpia',
      },
      {
        id: 'vila-olimpia-03',
        src: imagePool.home,
        alt: 'Espaço colaborativo do Escritório Vila Olímpia',
      },
    ],
  },
  {
    id: '8',
    slug: 'penthouse-jardins',
    title: 'Penthouse Jardins',
    year: 2021,
    category: 'Residencial',
    location: 'Jardins, São Paulo',
    area: '390 m²',
    gradient: 'bg-gradient-to-br from-stone-600 via-zinc-800 to-neutral-950',
    description: [
      'Penthouse com áreas sociais amplas, terraço integrado e uma atmosfera que combina precisão arquitetônica com conforto residencial.',
      'O projeto organiza vistas, circulação e materialidade para criar uma experiência contínua entre interior e exterior.',
    ],
    images: [
      { id: 'jardins-01', src: imagePool.home, alt: 'Ambiente principal da Penthouse Jardins' },
      { id: 'jardins-02', src: imagePool.living, alt: 'Sala da Penthouse Jardins' },
      {
        id: 'jardins-03',
        src: imagePool.launch,
        alt: 'Detalhe arquitetônico da Penthouse Jardins',
      },
    ],
  },
]

export const PROJECT_CATEGORIES = [...new Set(PROJECTS.map((project) => project.category))]

export function getProjectBySlug(slug: string) {
  return PROJECTS.find((project) => project.slug === slug)
}

export function getAdjacentProjects(slug: string) {
  const currentIndex = PROJECTS.findIndex((project) => project.slug === slug)

  if (currentIndex === -1) {
    return { previous: null, next: null }
  }

  return {
    previous: PROJECTS[(currentIndex - 1 + PROJECTS.length) % PROJECTS.length],
    next: PROJECTS[(currentIndex + 1) % PROJECTS.length],
  }
}
