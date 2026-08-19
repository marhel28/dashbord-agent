// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  experimental: {
    appManifest: false
  },

  app: {
    head: {
      title: 'UMKM ADMIN DASHBOARD',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Sistem Manajemen Admin untuk UMKM' },
        { property: 'og:title', content: 'UMKM ADMIN DASHBOARD' },
        { property: 'og:description', content: 'Sistem Manajemen Admin untuk UMKM' },
        { property: 'og:image', content: '/logo.png' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'UMKM ADMIN DASHBOARD' },
        { name: 'twitter:description', content: 'Sistem Manajemen Admin untuk UMKM' },
        { name: 'twitter:image', content: '/logo.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ]
    }
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.VITE_API_BASE || process.env.NUXT_PUBLIC_API_BASE || 'https://cctv-api.desa-sidomukti.com'
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/color-mode'
  ],

  components: [
    {
      path: '~/components/ui',
      extensions: ['.vue'],
      pathPrefix: false
    },
    {
      path: '~/components',
      extensions: ['.vue'],
      pathPrefix: false
    }
  ],

  css: ['~/assets/css/theme.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  fonts: {
    families: [
      { name: 'Inter', weights: [400, 500, 600, 700] },
      { name: 'JetBrains Mono', weights: [400, 500, 600] }
    ]
  }
})
