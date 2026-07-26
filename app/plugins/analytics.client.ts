/**
 * Google Analytics 4 for inesa.institute
 *
 * Enable with either:
 *   NUXT_PUBLIC_GA_ID=G-XXXXXXXXXX
 *   NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const measurementId = String(
    config.public.gaId || config.public.gaMeasurementId || '',
  ).trim()

  if (!measurementId || !measurementId.startsWith('G-')) {
    return
  }

  const w = window as Window & {
    dataLayer?: IArguments[]
    gtag?: (...args: unknown[]) => void
  }

  w.dataLayer = w.dataLayer || []
  // Must push the Arguments object (gtag protocol), not a rest array
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments as unknown as IArguments)
  }
  w.gtag('js', new Date())
  w.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  })

  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
        async: true,
      },
    ],
  })

  const router = useRouter()
  router.afterEach((to) => {
    w.gtag?.('config', measurementId, {
      page_path: to.fullPath,
      anonymize_ip: true,
    })
  })
})
