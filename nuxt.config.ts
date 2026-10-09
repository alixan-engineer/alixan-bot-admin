import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devServer: { port: 5105 },
  app: { rootId: 'root' },
  css: ['~/assets/css/tailwind.css'],
  features: { inlineStyles: true },
  vite: {
    plugins: [
      tailwindcss(),
      // TODO: после обновления Nuxt до версии с исправлением #36477 удалить
      // этот плагин и optimizeDeps.exclude ниже; проверить npm run dev.
      // https://github.com/nuxt/nuxt/pull/36477
      {
        name: 'i18n-scan-workaround',
        configResolved(config) {
          // Nuxt 4.6.0 adds i18n runtime files directly to Vite's scan.
          const options = config.environments.client?.optimizeDeps;
          if (options && Array.isArray(options.entries)) {
            options.entries = options.entries.filter(
              entry =>
                !entry
                  .replace(/\\/g, '/')
                  .includes('/node_modules/@nuxtjs/i18n/'),
            );
          }
        },
      },
    ],
    // Work around Nuxt 4.6.0 / Vite 8 scanning i18n's #components import.
    optimizeDeps: {
      exclude: ['@nuxtjs/i18n'],
    },
  },
  components: [{ path: '~/components', pathPrefix: false }],
  modules: [
    ['@nuxtjs/google-fonts', { families: { Inter: true } }],
    '@nuxtjs/color-mode',
    '@nuxtjs/i18n',
  ],
  colorMode: {
    preference: 'system',
    fallback: 'light',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '',
    storage: 'cookie',
    storageKey: 'admin-color-mode',
  },
  i18n: {
    vueI18n: './configs/i18n.config.ts',
    defaultLocale: 'ru',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'kk', name: 'Қазақша', file: 'kk.json' },
    ],
  },
});
