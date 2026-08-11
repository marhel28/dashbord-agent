// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'UMKM MERCHANT DASHBOARD',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'Sistem Manajemen Toko & Dashboard Merchant UMKM' },
        { property: 'og:title', content: 'UMKM MERCHANT DASHBOARD' },
        { property: 'og:description', content: 'Sistem Manajemen Toko & Dashboard Merchant UMKM' },
        { property: 'og:image', content: '/logo.png' },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'UMKM MERCHANT DASHBOARD' },
        { name: 'twitter:description', content: 'Sistem Manajemen Toko & Dashboard Merchant UMKM' },
        { name: 'twitter:image', content: '/logo.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/logo.png' }
      ]
    }
  },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@nuxtjs/color-mode'
  ],

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light'
  },

  fonts: {
    families: [
      { name: 'Fira Sans', weights: [300, 400, 500, 600, 700, 800] },
      { name: 'Fira Code', weights: [400, 500, 600, 700] }
    ]
  }
})
