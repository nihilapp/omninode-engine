import tailwindcss from '@tailwindcss/vite';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: {
    enabled: true,
  },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/image',
    '@element-plus/nuxt',
  ],
  css: [
    '~/assets/styles/tailwind.css',
  ],
  imports: {
    dirs: [
      '~/composables/*.ts',
      '~/composables/query/**/!(index).ts',
      '~/utils/**/!(index).ts',
      '~/data/**',
      '~/config/**',
    ],
    presets: [
      {
        from: 'class-variance-authority',
        imports: [
          'cva',
          'cx',
        ],
      },
      {
        from: 'luxon',
        imports: [
          'DateTime',
          'Duration',
          'FixedOffsetZone',
          'IANAZone',
          'Info',
          'Interval',
          'InvalidZone',
          'Settings',
          'SystemZone',
          'VERSION',
          'Zone',
        ],
      },
    ],
  },
  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
    ],
  },
  nitro: {
    imports: {
      dirs: [
        'server/db',
        'server/utils',
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
});
