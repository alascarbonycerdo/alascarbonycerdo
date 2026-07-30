export default defineNuxtConfig({
  compatibilityDate: '2025-07-16',

  modules: ['@nuxt/ui', '@nuxt/icon', '@nuxt/fonts', '@nuxtjs/supabase'],

  ssr: true,
  devtools: { enabled: true },

  supabase: {
    // La protección de rutas la manejan los middleware propios (staff/admin/guest),
    // no la redirección automática del módulo: así distinguimos vendedor de
    // administrador, cosa que el `redirect` del módulo no sabe hacer.
    redirect: false,
  },

  fonts: {
    families: [
      { name: 'Bungee Inline', provider: 'google', weights: [400] },
      { name: 'Oswald', provider: 'google', weights: [400, 500, 600, 700] },
    ],
  },

  css: ['~/assets/css/main.css'],

  components: {
    dirs: [
      { path: '~/components/dashboard', pathPrefix: false },
      { path: '~/components/costing', pathPrefix: false },
      '~/components',
    ],
  },

  nitro: {
    storage: {
      dashboard: { driver: 'fs', base: './.data/dashboard' },
    },
  },

  routeRules: {
    // Menú público: mismo HTML para cualquier visitante (no hay sesión ni datos
    // por usuario), así que se sirve desde el edge de Netlify y se revalida en
    // segundo plano cada hora en vez de renderizar en cada visita.
    '/': { isr: 3600 },

    // Dashboard y API: contenido autenticado y distinto por usuario/rol — nunca
    // se debe cachear, o un vendedor podría terminar viendo la respuesta cacheada
    // de otro.
    // El comodín ** no cubre /dashboard a secas, y ese índice ya no es estático:
    // muestra tiles distintos según el rol, así que se marca aparte.
    '/dashboard': { cache: false },
    '/dashboard/**': { cache: false },
    '/api/**': { cache: false },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      title: 'Alas Carbón & Cerdo | Menú',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Alas y cerdo al carbón. Pide por WhatsApp — domicilios disponibles.',
        },
        { name: 'theme-color', content: '#171210' },
      ],
      link: [{ rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
    },
  },
})
