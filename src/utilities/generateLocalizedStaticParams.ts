import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { locales } from '@/i18n/config'

type CollectionSlug = 'pages' | 'posts'

type GenerateStaticParamsOptions = {
  collection: CollectionSlug
  filter?: (doc: { slug?: string | null }) => boolean
}

export async function generateLocalizedStaticParams({
  collection,
  filter,
}: GenerateStaticParamsOptions): Promise<Array<{ locale: string; slug: string }>> {
  const payload = await getPayload({ config: configPromise })

  const params: Array<{ locale: string; slug: string }> = []

  for (const locale of locales) {
    const result = await payload.find({
      collection,
      draft: false,
      limit: 1000,
      locale,
      overrideAccess: false,
      pagination: false,
      select: {
        slug: true,
      },
    })

    const docs = filter ? result.docs.filter(filter) : result.docs

    docs.forEach(({ slug }) => {
      params.push({ locale, slug: slug as string })
    })
  }

  return params
}
