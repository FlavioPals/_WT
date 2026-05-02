import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import { getAdminProject } from '@/lib/api/projects'
import { ProjectEditForms } from './_components/ProjectEditForms'

type Props = { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params

  let project
  try {
    project = await getAdminProject(id)
  } catch {
    notFound()
  }

  if (!project) notFound()

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <Link
          href="/dashboard/projetos"
          className="text-primary/45 hover:text-primary mb-4 inline-flex items-center gap-2 text-[11px] tracking-[0.18em] uppercase transition-colors"
        >
          <ArrowLeft size={13} strokeWidth={1.5} aria-hidden="true" />
          Projetos
        </Link>
        <p className="text-primary/45 mb-2 text-[11px] tracking-[0.22em] uppercase">
          Editar projeto
        </p>
        <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
          {project.title}
        </h1>
      </div>

      <ProjectEditForms project={project} />
    </div>
  )
}
