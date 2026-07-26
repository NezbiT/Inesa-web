const SITE_URL = 'https://inesa.institute'
const OG_IMAGE = `${SITE_URL}/og-image.jpg`
const DEFAULT_DESCRIPTION =
  'INESA — Instituto de Evaluación Sensorial Alimentos. Evaluación sensorial, ciencia del consumidor y capacitaciones. Houston, TX, USA.'

function isLocalHost(host: string): boolean {
  return (
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1') ||
    host.startsWith('0.0.0.0') ||
    host.endsWith('.local')
  )
}

export function useSiteSeo(options?: {
  title?: string
  description?: string
  path?: string
  image?: string
  type?: string
  noindex?: boolean
}) {
  const { t, locale } = useI18n()
  const route = useRoute()
  const config = useRuntimeConfig()
  // Capture request URL once in setup (not inside nested helpers) for SSR/prerender safety.
  const requestURL = import.meta.server ? useRequestURL() : null
  const configuredOrigin = String(config.public.siteUrl || SITE_URL).replace(/\/$/, '') || SITE_URL

  const siteOrigin = computed(() => {
    // Prerender / local SSR often reports localhost — never publish that as canonical.
    if (import.meta.server && requestURL) {
      const host = requestURL.host || ''
      if (!isLocalHost(host) && requestURL.protocol && requestURL.host) {
        return `${requestURL.protocol}//${requestURL.host}`.replace(/\/$/, '')
      }
    }
    return configuredOrigin
  })

  const title = computed(
    () => options?.title || `${t('site.title')} — ${t('site.subtitle')}`,
  )
  const description = computed(() => options?.description || t('seo.defaultDescription') || DEFAULT_DESCRIPTION)
  const path = computed(() => options?.path || route.path || '/')
  const canonical = computed(() => {
    const clean = path.value.startsWith('/') ? path.value : `/${path.value}`
    return `${siteOrigin.value}${clean === '/' ? '' : clean}`
  })
  const image = computed(() => options?.image || OG_IMAGE)
  const ogLocale = computed(() => {
    if (locale.value === 'en') return 'en_US'
    if (locale.value === 'fr') return 'fr_FR'
    return 'es_ES'
  })

  useHead(() => ({
    title: title.value,
    htmlAttrs: {
      lang: locale.value,
    },
    meta: [
      // Keep viewport first in dynamic head so mobile crawlers always see it
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'description', content: description.value },
      { name: 'theme-color', content: '#e94f1d' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'format-detection', content: 'telephone=yes' },
      ...(options?.noindex ? [{ name: 'robots', content: 'noindex, nofollow' }] : []),
      // Open Graph
      { property: 'og:type', content: options?.type || 'website' },
      { property: 'og:site_name', content: 'INESA' },
      { property: 'og:title', content: title.value },
      { property: 'og:description', content: description.value },
      { property: 'og:url', content: canonical.value },
      { property: 'og:image', content: image.value },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:locale', content: ogLocale.value },
      // Twitter
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title.value },
      { name: 'twitter:description', content: description.value },
      { name: 'twitter:image', content: image.value },
    ],
    link: [
      { rel: 'canonical', href: canonical.value },
    ],
  }))

  return { title, description, canonical, image, siteUrl: SITE_URL }
}

export function useLocalBusinessSchema() {
  const { t } = useI18n()
  const email = computed(() => t('contact.email'))
  const phone = computed(() => t('contact.phone'))

  useHead(() => {
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      '@id': 'https://inesa.institute/#organization',
      name: 'INESA — Instituto de Evaluación Sensorial Alimentos',
      alternateName: 'INESA Institute',
      url: 'https://inesa.institute',
      logo: 'https://inesa.institute/logo-inesa.svg',
      image: 'https://inesa.institute/og-image.jpg',
      description:
        'Instituto de evaluación sensorial y ciencia del consumidor para la industria alimentaria y productos de consumo.',
      email: email.value,
      telephone: phone.value || undefined,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Houston',
        addressRegion: 'TX',
        addressCountry: 'US',
        streetAddress: t('contact.address'),
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 29.7604,
        longitude: -95.3698,
      },
      areaServed: {
        '@type': 'Country',
        name: 'United States',
      },
      sameAs: [
        'https://www.instagram.com/inesa_institute/',
        'https://www.facebook.com/p/Inesa-Institute-61566629233696/',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: email.value,
        telephone: phone.value || undefined,
        availableLanguage: ['Spanish', 'English', 'French'],
      },
    }

    return {
      script: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(schema),
        },
      ],
    }
  })
}
