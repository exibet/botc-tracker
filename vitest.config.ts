import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    include: ['tests/unit/**/*.test.ts', 'tests/components/**/*.test.ts'],
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        overrides: {
          supabase: {
            url: 'https://test.supabase.co',
            key: 'test-anon-key',
          },
        },
      },
    },
  },
})
