import { resolve } from 'node:path'
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  resolve: {
    alias: {
      '#supabase/server': resolve(__dirname, 'tests/helpers/supabase-server-stub.ts'),
    },
  },
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
