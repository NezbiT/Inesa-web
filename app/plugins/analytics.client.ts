/**
 * Google Analytics 4 — only loads when NUXT_PUBLIC_GA_MEASUREMENT_ID is set.
 * Set in Vercel env: NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const measurementId = String(config.public.gaMeasurementId || '').trim()

  if (!measurementId || !measurementId.startsWith('G-')) {
    return
  }

  // gtag bootstrap
  const w = window as Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void }
  w.dataLayer = w.dataLayer || []
  w.gtag = function gtag(...args: unknown[]) {
    w.dataLayer?.push(args)
  }
  w.gtag('js', new Date())
  w.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true,
  })

  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${measurementId}`,
        async: true,
      },
    ],
  })

  // SPA route pageviews
  const router = useRouter()
  router.afterEach((to) => {
    w.gtag?.('config', measurementId, {
      page_path: to.fullPath,
      anonymize_ip: true,
    })
  })
})