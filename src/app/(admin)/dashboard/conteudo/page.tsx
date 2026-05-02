import { getAdminSiteContent, getSiteContentValue } from '@/lib/api/site'
import { ContentForm } from './_components/ContentForm'

export const metadata = {
  title: 'Conteúdo',
}

export default async function DashboardConteudoPage() {
  const contents = await getAdminSiteContent()

  const defaultValues = {
    manifesto: getSiteContentValue(contents, 'home:manifesto'),
    about: getSiteContentValue(contents, 'sobre:about'),
    contactPhone: getSiteContentValue(contents, 'contato:phone'),
    contactEmail: getSiteContentValue(contents, 'contato:email'),
    contactCity: getSiteContentValue(contents, 'contato:city'),
    instagram: getSiteContentValue(contents, 'contato:instagram'),
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <p className="text-primary/45 mb-3 text-[11px] tracking-[0.22em] uppercase">Conteúdo</p>
        <h1 className="font-display text-4xl leading-tight font-light lg:text-5xl">
          Editar textos e contatos
        </h1>
      </div>

      <ContentForm defaultValues={defaultValues} />
    </div>
  )
}
