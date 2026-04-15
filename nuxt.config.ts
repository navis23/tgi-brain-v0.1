// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'
import pkg from './package.json'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  ssr: false,

  app: {
    head: {
      title: 'TGI BRAIN',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'description', content: 'TGI Conglomerate Knowledge Management System — Visualize and Execute' },
        { name: 'theme-color', content: '#111111' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'TGI BRAIN' },
        { name: 'mobile-web-app-capable', content: 'yes' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=DM+Sans:ital,wght@0,400;0,500;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'mask-icon', href: '/pwa-icon.svg', color: '#111111' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      include: [
        '@supabase/supabase-js',
        'md-editor-v3',
        'd3',
      ]
    }
  },

  modules: [
    '@pinia/nuxt',
    '@nuxt/icon',
    '@vite-pwa/nuxt',
  ],

  pwa: {
    registerType: 'autoUpdate',
    injectRegister: 'auto',
    strategies: 'generateSW',
    includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-icon.svg'],
    manifest: {
      name: 'TGI BRAIN',
      short_name: 'TGI BRAIN',
      description: 'TGI Conglomerate Knowledge Management System',
      theme_color: '#111111',
      background_color: '#FAF9F6',
      display: 'standalone',
      orientation: 'any',
      start_url: '/',
      scope: '/',
      lang: 'en',
      categories: ['productivity', 'business'],
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
      navigateFallback: '/',
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-api',
            networkTimeoutSeconds: 5,
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
            cacheableResponse: { statuses: [0, 200] },
          },
        },
      ],
    },
    devOptions: {
      enabled: false,
      type: 'module',
    },
  },

  imports: {
    dirs: ['stores'],
  },

  runtimeConfig: {
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      appVersion: pkg.version,
    }
  }
})
