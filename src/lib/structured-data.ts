import { PROJECTS, type Project } from '@/lib/projects'
import { absoluteUrl, SITE_CONTACT, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ArchitecturalService',
    '@id': `${SITE_URL}#studio-wt`,
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    telephone: SITE_CONTACT.phone,
    email: SITE_CONTACT.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: SITE_CONTACT.city,
      addressRegion: SITE_CONTACT.region,
      addressCountry: SITE_CONTACT.country,
    },
    sameAs: [SITE_CONTACT.instagram],
    image: absoluteUrl('/logos/logo-dark.png'),
    areaServed: {
      '@type': 'Country',
      name: 'Brasil',
    },
    knowsAbout: [
      'Arquitetura residencial',
      'Arquitetura corporativa',
      'Design de interiores',
      'Retrofit',
    ],
  }
}

export function portfolioCollectionJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Portfólio | ${SITE_NAME}`,
    url: absoluteUrl('/portfolio'),
    description: 'Galeria de projetos residenciais, corporativos e de interiores do Studio WT.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: PROJECTS.map((project, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: absoluteUrl(`/portfolio/${project.slug}`),
        name: project.title,
      })),
    },
  }
}

export function projectImageGalleryJsonLd(project: Project) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ImageGallery',
    name: `${project.title} | ${SITE_NAME}`,
    url: absoluteUrl(`/portfolio/${project.slug}`),
    description: project.description.join(' '),
    image: project.images.map((image) => ({
      '@type': 'ImageObject',
      url: absoluteUrl(image.src),
      caption: image.alt,
    })),
    about: {
      '@type': 'CreativeWork',
      name: project.title,
      locationCreated: project.location,
      dateCreated: String(project.year),
    },
  }
}
