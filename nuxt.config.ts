import tailwindcss from '@tailwindcss/vite'
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

const BotCPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{red.50}',
      100: '{red.100}',
      200: '{red.200}',
      300: '{red.300}',
      400: '{red.400}',
      500: '{red.500}',
      600: '{red.600}',
      700: '{red.700}',
      800: '{red.800}',
      900: '{red.900}',
      950: '{red.950}',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{zinc.50}',
          100: '{zinc.100}',
          200: '{zinc.200}',
          300: '{zinc.300}',
          400: '{zinc.400}',
          500: '{zinc.500}',
          600: '{zinc.600}',
          700: '{zinc.700}',
          800: '{zinc.800}',
          900: '{zinc.900}',
          950: '{zinc.950}',
        },
      },
    },
  },
})

export default defineNuxtConfig({

  modules: [
    '@primevue/nuxt-module',
    '@nuxtjs/supabase',
    '@nuxt/eslint',
    '@nuxtjs/google-fonts',
  ],

  devtools: { enabled: false },

  app: {
    head: {
      title: 'BotC Tracker - Blood on the Clocktower Community Stats',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'description', content: 'Track Blood on the Clocktower games, player stats, win rates & MVP votes. Join the community game tracker now ✓' },
        { name: 'referrer', content: 'no-referrer' },
        { name: 'theme-color', content: '#ef4444' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'BotC Tracker' },
        { property: 'og:title', content: 'BotC Tracker - Blood on the Clocktower Community Hub' },
        { property: 'og:description', content: 'Track games, analyze player performance, discover top players & roles. Real-time stats for Blood on the Clocktower players.' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'BotC Tracker' },
        { property: 'og:locale', content: 'uk_UA' },
        { property: 'og:locale:alternate', content: 'en_US' },
        { property: 'og:image', content: 'https://botc-tracker.vercel.app/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: 'https://botc-tracker.vercel.app/og-image.png' },
        { name: 'twitter:title', content: 'BotC Tracker - Game Stats & Community Analytics' },
        { name: 'twitter:description', content: 'Real-time tracking of Blood on the Clocktower games, player stats, win rates, and MVP voting.' },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/svg+xml',
          href: '/favicon.svg',
        },
        {
          rel: 'manifest',
          href: '/site.webmanifest',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  features: {
    inlineStyles: true,
  },
  compatibilityDate: '2025-07-15',

  vite: {
    plugins: [tailwindcss()],
  },

  primevue: {
    options: {
      theme: {
        preset: BotCPreset,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark',
          cssLayer: {
            name: 'primevue',
            order: 'tw-base, primevue, tw-utilities',
          },
        },
      },
    },
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      },
    },
  },

  googleFonts: {
    families: {
      Cinzel: [400, 500, 600, 700],
      Inter: [300, 400, 500, 600, 700],
    },
    display: 'swap',
    download: true,
    preload: true,
  },

  supabase: {
    redirect: false,
  },
})
