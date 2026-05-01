import { HeroCarousel, type HeroSlide } from '@/components/home/HeroCarousel'
import { ManifestoSection } from '@/components/home/ManifestoSection'

// TODO: replace with db.project.findMany({ where: { featured: true }, orderBy: { order: 'asc' } })
const FEATURED_PROJECTS: HeroSlide[] = [
  {
    id: 'projeto-01',
    title: 'Projeto 01',
    imageUrl: '/logos/image/download.jpg',
  },
  {
    id: 'projeto-02',
    title: 'Projeto 02',
    imageUrl: '/logos/image/download (1).jpg',
  },
  {
    id: 'projeto-03',
    title: 'Projeto 03',
    imageUrl: '/logos/image/CreativeRender _ Soluções completas para lançamentos imobiliários.jpg',
  },
  {
    id: 'projeto-04',
    title: 'Projeto 04',
    imageUrl: '/logos/image/Home_ The emotional side — comfort, warmth, family_.jpg',
  },
]

export default function HomePage() {
  return (
    <>
      <HeroCarousel slides={FEATURED_PROJECTS} />
      <ManifestoSection />
    </>
  )
}
