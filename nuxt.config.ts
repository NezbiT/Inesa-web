// https://nuxt.com/docs/api/configuration/nuxt-config

const securityHeaders = {
  'X-Frame-Options': 'SAMEORIGIN',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-DNS-Prefetch-Control': 'on',
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
    "object-src 'none'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' https://fonts.gstatic.com data:",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://www.googletagmanager.com",
    'upgrade-insecure-requests',
  ].join('; '),
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n'],

  typescript: {
    strict: true,
    typeCheck: false,
  },

  css: ['~/assets/css/main.css', '~/assets/css/lms.css'],

  // Marketing + academy shells as static HTML so SSR cold starts / native deps
  // cannot take down public pages. LMS APIs remain dynamic.
  routeRules: {
    '/**': { headers: securityHeaders },
    '/': { prerender: true },
    '/about': { prerender: true },
    '/services': { prerender: true },
    '/gallery': { prerender: true },
    '/contact': { prerender: true },
    '/courses': { prerender: true },
    '/privacy': { prerender: true },
    '/terms': { prerender: true },
    '/academy': { prerender: true },
    '/academy/login': { prerender: true },
    '/en': { prerender: true },
    '/en/about': { prerender: true },
    '/en/services': { prerender: true },
    '/en/gallery': { prerender: true },
    '/en/contact': { prerender: true },
    '/en/courses': { prerender: true },
    '/en/privacy': { prerender: true },
    '/en/terms': { prerender: true },
    '/fr': { prerender: true },
    '/fr/about': { prerender: true },
    '/fr/services': { prerender: true },
    '/fr/gallery': { prerender: true },
    '/fr/contact': { prerender: true },
    '/fr/courses': { prerender: true },
    '/fr/privacy': { prerender: true },
    '/fr/terms': { prerender: true },
  },

  nitro: {
    // Keep heavy PDF parsers out of the serverless entry graph.
    // better-sqlite3 is lazy-required in server/utils/db.ts (not top-level imported)
    // so marketing SSR does not crash when the native module is unavailable.
    rollupConfig: {
      external: ['pdf-parse', 'pdfjs-dist'],
    },
    compressPublicAssets: true,
    prerender: {
      crawlLinks: true,
      failOnError: false,
    },
  },

  runtimeConfig: {
    inesaJwtSecret: process.env.INESA_JWT_SECRET || 'inesa-dev-secret-change-me',
    inesaAdminEmail: process.env.INESA_ADMIN_EMAIL || 'admin@inesa.com',
    inesaAdminPassword: process.env.INESA_ADMIN_PASSWORD || 'admin123',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
    xaiApiKey: process.env.XAI_API_KEY || '',
    xaiModel: process.env.XAI_MODEL || 'grok-4-1-fast-non-reasoning',
    aiProvider: process.env.AI_PROVIDER || 'gemini',
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://inesa.institute',
      // Set NUXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX on Vercel to enable GA4
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
    },
  },

  app: {
    head: {
      title: 'INESA — Sensory Evaluation Institute',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        // Must stay early in <head> for mobile crawlers / Lighthouse
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1, viewport-fit=cover',
        },
        { name: 'theme-color', content: '#e94f1d' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'description',
          content:
            'INESA — Instituto de Evaluación Sensorial Alimentos. Evaluación sensorial, ciencia del consumidor y capacitaciones. Houston, TX, USA.',
        },
        { name: 'format-detection', content: 'telephone=yes' },
        // Default Open Graph (pages can override via useSiteSeo)
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'INESA' },
        { property: 'og:title', content: 'INESA — Sensory Evaluation Institute' },
        {
          property: 'og:description',
          content:
            'Instituto de evaluación sensorial y ciencia del consumidor. Houston, TX, USA.',
        },
        { property: 'og:url', content: 'https://inesa.institute' },
        { property: 'og:image', content: 'https://inesa.institute/og-image.jpg' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: 'es_ES' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'INESA — Sensory Evaluation Institute' },
        {
          name: 'twitter:description',
          content:
            'Instituto de evaluación sensorial y ciencia del consumidor. Houston, TX, USA.',
        },
        { name: 'twitter:image', content: 'https://inesa.institute/og-image.jpg' },
      ],
      link: [
        { rel: 'canonical', href: 'https://inesa.institute' },
        // Light icons (old logo-inesa.png was ~428KB)
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        // LCP: hero logo webp on home (also helps first paint on marketing pages)
        {
          rel: 'preload',
          as: 'image',
          href: '/images/branding/logo-layers/logo-closed.webp',
          type: 'image/webp',
          fetchpriority: 'high',
        },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        // Non-blocking webfonts — system fonts paint immediately
        {
          rel: 'preload',
          as: 'style',
          href: 'https://fonts.googleapis.com/css2?family=Enriqueta:wght@400;700&family=Mulish:wght@300;400;700&display=swap',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Enriqueta:wght@400;700&family=Mulish:wght@300;400;700&display=swap',
          media: 'print',
          onload: "this.media='all'",
        },
      ],
      noscript: [
        {
          children:
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Enriqueta:wght@400;700&family=Mulish:wght@300;400;700&display=swap">',
        },
      ],
    },
  },

  devServer: {
    port: 3000,
  },

  i18n: {
    locales: [
      { code: 'es', language: 'es-ES', file: 'es.json', name: 'Español' },
      { code: 'en', language: 'en-US', file: 'en.json', name: 'English' },
      { code: 'fr', language: 'fr-FR', file: 'fr.json', name: 'Français' },
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    langDir: 'locales',
    lazy: true,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'ineca-locale',
      fallbackLocale: 'es',
    },
  },

  vite: {
    vue: {
      template: {
        // Keep /images/* as public URLs (gallery lives in public/images/)
        transformAssetUrls: false,
      },
    },
    server: {
      watch: {
        // Windows locks JPG files in public/ → EBUSY crash without this ignore
        ignored: ['**/public/images/**'],
      },
    },
  },
})
