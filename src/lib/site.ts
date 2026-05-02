export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

export const SITE_NAME = 'Studio WT Arquitetura e Design'

export const SITE_DESCRIPTION =
  'Studio WT é um escritório de arquitetura e design baseado em São Paulo, com foco em projetos residenciais, corporativos e interiores.'

export const SITE_CONTACT = {
  city: 'São Paulo',
  region: 'SP',
  country: 'BR',
  phone: '+55 (11) 99999-9999',
  email: 'contato@studiowt.com.br',
  instagram: 'https://instagram.com/studiowt',
}

export function absoluteUrl(path = '/') {
  return new URL(path, SITE_URL).toString()
}
