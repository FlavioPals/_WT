import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel'
import { ManifestoSection } from '@/components/home/ManifestoSection'
import { getPublicProjects } from '@/lib/api/projects'

export default async function HomePage() {
  const { data: projects } = await getPublicProjects({ featured: true, limit: 4, sort: 'order' })

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
      <ManifestoSection />
    </>
  )
}
