export type ProjectImageType = 'gallery' | 'technical' | 'artistic'

export interface ProjectImage {
  id: string
  src: string
  alt: string
  type: ProjectImageType
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
  concept: string
  description: string[]
  images: ProjectImage[]
}
