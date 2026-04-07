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
  ],

  devtools: { enabled: true },

  app: {
    head: {
      title: 'Blood on the Clocktower Tracker',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Трекер ігор Blood on the Clocktower для ком\'юніті' },
        { name: 'referrer', content: 'no-referrer' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          // eslint-disable-next-line vue/max-len
          href: 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],
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
          cssLayer: false,
        },
      },
    },
  },

  supabase: {
    redirect: false,
  },
})
