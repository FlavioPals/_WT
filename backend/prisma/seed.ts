import 'dotenv/config'
import argon2 from 'argon2'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, SiteContentType } from '../src/generated/prisma/client'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SITE_CONTENT_DEFAULTS: Array<{
  key: string
  value: string
  label: string
  type: SiteContentType
  group: string
  description?: string
}> = [
  {
    key: 'home_manifesto_title',
    value: 'Design que acolhe, inspira e transforma.',
    label: 'Manifesto — Título',
    type: SiteContentType.TEXT,
    group: 'home',
  },
  {
    key: 'home_manifesto_body',
    value:
      'Acreditamos que cada espaço carrega uma história. Nossa missão é revelar essa história por meio de formas, luz e materiais que dialogam com quem os habita.',
    label: 'Manifesto — Texto',
    type: SiteContentType.RICH_TEXT,
    group: 'home',
  },
  {
    key: 'home_hero_image',
    value: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    label: 'Home - Imagem principal',
    type: SiteContentType.IMAGE,
    group: 'home',
    description: 'Imagem solta da home gerenciavel pela biblioteca de midia.',
  },
  {
    key: 'about_intro',
    value:
      'Somos um escritório de arquitetura comprometido com projetos residenciais, corporativos e de interiores que equilibram funcionalidade, estética e identidade.',
    label: 'Sobre — Introdução',
    type: SiteContentType.RICH_TEXT,
    group: 'about',
  },
  {
    key: 'about_cover_image',
    value: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    label: 'Sobre - Imagem institucional',
    type: SiteContentType.IMAGE,
    group: 'about',
    description: 'Imagem institucional solta da pagina Sobre.',
  },
  {
    key: 'about_services',
    value: 'Residencial, Corporativo, Interiores, Retrofit',
    label: 'Sobre - Areas de atuacao',
    type: SiteContentType.TEXT,
    group: 'about',
    description: 'Lista textual das areas de atuacao exibidas no site.',
  },
  {
    key: 'about_stats_founded',
    value: '2022',
    label: 'Sobre — Ano de fundação',
    type: SiteContentType.TEXT,
    group: 'about',
  },
  {
    key: 'about_stats_projects',
    value: '80',
    label: 'Sobre — Número de projetos',
    type: SiteContentType.TEXT,
    group: 'about',
  },
  {
    key: 'about_stats_team',
    value: '3',
    label: 'Sobre — Tamanho da equipe',
    type: SiteContentType.TEXT,
    group: 'about',
  },
  {
    key: 'portfolio_intro',
    value: 'Projetos selecionados que revelam nossa forma de pensar espaco, luz e permanencia.',
    label: 'Portfolio - Introducao',
    type: SiteContentType.TEXT,
    group: 'portfolio',
    description: 'Texto curto de apoio para a pagina de portfolio.',
  },
  {
    key: 'contact_phone',
    value: '+55 11 99999-9999',
    label: 'Contato — Telefone/WhatsApp',
    type: SiteContentType.PHONE,
    group: 'contact',
  },
  {
    key: 'contact_email',
    value: 'contato@escritorio.com',
    label: 'Contato — E-mail',
    type: SiteContentType.EMAIL,
    group: 'contact',
  },
  {
    key: 'contact_city',
    value: 'Sao Paulo - SP',
    label: 'Contato - Cidade',
    type: SiteContentType.TEXT,
    group: 'contact',
    description: 'Cidade exibida no rodape e cards de contato.',
  },
  {
    key: 'contact_instagram',
    value: 'https://instagram.com/escritorio',
    label: 'Contato — Instagram',
    type: SiteContentType.URL,
    group: 'contact',
  },
  {
    key: 'footer_address',
    value: 'São Paulo, SP — Brasil',
    label: 'Rodapé — Endereço',
    type: SiteContentType.TEXT,
    group: 'footer',
  },
  {
    key: 'seo_default_title',
    value: 'Escritório de Arquitetura',
    label: 'SEO — Título padrão',
    type: SiteContentType.TEXT,
    group: 'seo',
  },
  {
    key: 'seo_default_description',
    value: 'Criamos espaços que transformam vidas através de arquitetura com propósito.',
    label: 'SEO — Descrição padrão',
    type: SiteContentType.TEXT,
    group: 'seo',
  },
  {
    key: 'seo_default_image',
    value: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    label: 'SEO - Imagem padrao',
    type: SiteContentType.IMAGE,
    group: 'seo',
    description: 'Imagem padrao para compartilhamento social.',
  },
]

async function main() {
  console.log('🌱 Starting seed...')

  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@example.com'
  const adminPassword = await argon2.hash(process.env.ADMIN_PASSWORD ?? 'change-me-in-production')

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: process.env.ADMIN_NAME ?? 'Administrador',
      password: adminPassword,
      role: 'ADMIN',
    },
  })

  console.log(`✅ Admin user: ${admin.email}`)

  // Site content
  for (const content of SITE_CONTENT_DEFAULTS) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: {
        label: content.label,
        type: content.type,
        group: content.group,
        description: content.description ?? null,
      },
      create: content,
    })
  }

  console.log(`✅ Site content: ${SITE_CONTENT_DEFAULTS.length} keys seeded`)
  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
