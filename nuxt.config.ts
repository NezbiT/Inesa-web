// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxtjs/i18n'],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'INESA~C.A — Sensory Evaluation Institute',
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
        { name: 'theme-color', content: '#e94f1d' },
        {
          name: 'description',
          content:
            'INESA~C.A — Instituto de Evaluación Sensorial Alimentos. Houston, TX, USA.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo-inesa.png' },
        { rel: 'apple-touch-icon', href: '/logo-inesa.png' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Enriqueta:wght@400;700&family=Muli:wght@300;400;700&display=swap',
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