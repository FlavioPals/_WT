import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel'
import { ManifestoSection } from '@/components/home/ManifestoSection'
import { PROJECTS } from '@/lib/projects'

// TODO: replace with db.project.findMany({ where: { featured: true }, orderBy: { order: 'asc' } })
const FEATURED_PROJECTS: HeroSlide[] = PROJECTS.slice(0, 4).map((project) => ({
  id: project.id,
  title: project.title,
  imageUrl: project.imageUrl ?? project.images[0].src,
  href: `/portfolio/${project.slug}`,
  gradient: project.gradient,
}))

export default function HomePage() {
  return (
    <>
      <HeroCarousel slides={FEATURED_PROJECTS} />
      <ManifestoSection />
    </>
  )
}
