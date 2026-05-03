import { getAdminSiteContent, getSiteContentValue } from '@/lib/api/site'
import { ContentForm } from './_components/ContentForm'

export const metadata = {
  title: 'Conteúdo',
}

export default async function DashboardConteudoPage() {
  const contents = await getAdminSiteContent()

  const defaultValues = {
    manifesto: getSiteContentValue(contents, 'home_manifesto_body'),
    about: getSiteContentValue(contents, 'about_intro'),
    contactPhone: getSiteContentValue(contents, 'contact_phone'),
    contactEmail: getSiteContentValue(contents, 'contact_email'),
    contactCity: getSiteContentValue(contents, 'contact_city'),
    instagram: getSiteContentValue(contents, 'contact_instagram'),
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
