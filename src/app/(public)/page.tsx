import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel'
import { ManifestoSection } from '@/components/home/ManifestoSection'
import { getPublicProjects } from '@/lib/api/projects'
import { getSiteContent, getSiteContentValue } from '@/lib/api/site'

export default async function HomePage() {
  const [{ data: projects }, contents] = await Promise.all([
    getPublicProjects({ featured: true, limit: 4, sort: 'order' }),
    getSiteContent({ group: 'home' }),
  ])

  const slides: HeroSlide[] = projects.map((project) => ({
    id: project.id,
    title: project.title,
    imageUrl:
      project.coverImage ?? project.images?.cover[0]?.url ?? project.images?.gallery[0]?.url ?? '',
    href: `/portfolio/${project.slug}`,
    gradient: 'bg-gradient-to-br from-stone-700 via-stone-800 to-neutral-900',
  }))

  return (
    <>
      <HeroCarousel slides={slides} />
      <ManifestoSection
        title={getSiteContentValue(contents, 'home_manifesto_title')}
        body={getSiteContentValue(contents, 'home_manifesto_body')}
      />
    </>
  )
}
