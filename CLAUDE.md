# 📋 CLAUDE.md - Guía de Desarrollo Nuxt 4

Documento de referencia técnica para el desarrollo de aplicaciones web con Nuxt 4, siguiendo estándares internacionales de calidad y arquitectura moderna.

**Última actualización:** Julio 2026  
**Nuxt Version:** 4.x  
**Ambiente:** Producción

---

## 📑 Tabla de Contenidos

1. [Overview del Proyecto](#overview-del-proyecto)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración Inicial](#configuración-inicial)
5. [Estándares de Código](#estándares-de-código)
6. [Patrones y Convenciones](#patrones-y-convenciones)
7. [Composables Reutilizables](#composables-reutilizables)
8. [Internacionalización](#internacionalización)
9. [Optimización de Imágenes](#optimización-de-imágenes)
10. [Formularios](#formularios)
11. [UI y Theming](#ui-y-theming)
12. [Performance](#performance)
13. [Testing](#testing)
14. [Deployment](#deployment)

---

## 🎯 Overview del Proyecto

### Principios Fundamentales

- **Escalabilidad**: Arquitectura modular que crece con el proyecto
- **Mantenibilidad**: Código limpio, documentado y fácil de entender
- **Performance**: Optimización desde el inicio del desarrollo
- **Experiencia de Usuario**: Responsive, accesible y rápido
- **Internacionalización**: Soporte multi-idioma desde cero
- **TypeScript**: Type-safe en todo el stack

### Objetivos

```
✓ Aplicación moderna, rápida y escalable
✓ Experiencia de usuario excepcional
✓ Código mantenible y bien documentado
✓ Fácil onboarding para nuevos desarrolladores
✓ CI/CD ready
```

---

## 🛠️ Stack Tecnológico

### Core
```
Nuxt 4               → Framework meta-framework (SSR/SSG/SPA)
Vue 3               → UI Framework progresivo
TypeScript          → Type safety
Vite                → Build tool (integrado)
```

### UI & Components
```
@nuxt/ui            → Headless UI components (Headless UI + Tailwind CSS)
Tailwind CSS        → Utility-first CSS framework
@nuxt/icon          → Icon system (Lucide, Heroicons, etc.)
Radix UI            → Accesible component primitives (base de @nuxt/ui)
```

### Funcionalidades
```
@nuxt/i18n          → i18n internacional
@nuxt/image         → Optimización de imágenes
@formkit/auto-animate → Animaciones automáticas en formularios
```

### Herramientas Recomendadas
```
@vueuse/core        → Vue Composables utilidades
@vueuse/nuxt        → Integración VueUse con Nuxt
nuxt-gtag           → Google Analytics
@nuxtjs/sitemap     → Generación automática de sitemaps
@nuxtjs/robots      → Gestión de robots.txt
zod / valibot       → Schema validation
pinia               → State management (si es necesario)
```

---

## 📁 Estructura del Proyecto

```
proyecto/
├── .nuxt/                          # Output del build (gitignored)
├── .output/                         # Output SSR/SSG (gitignored)
├── app.vue                          # Root component
├── nuxt.config.ts                   # Configuración principal
├── tailwind.config.ts               # Tailwind config
├── tsconfig.json                    # TypeScript config
│
├── public/                          # Assets estáticos
│   ├── favicon.ico
│   ├── robots.txt
│   └── sitemap.xml
│
├── assets/                          # Assets compilados
│   ├── css/
│   │   ├── main.css                # Estilos globales
│   │   └── variables.css           # Variables CSS custom
│   ├── fonts/
│   │   └── inter/                  # Google Fonts o similares
│   └── images/
│       └── og-image.png            # OG images
│
├── components/
│   ├── common/                      # Componentes compartidos
│   │   ├── Header.vue
│   │   ├── Footer.vue
│   │   ├── Navigation.vue
│   │   └── Sidebar.vue
│   │
│   ├── ui/                          # Custom UI components
│   │   ├── Button.vue
│   │   ├── Card.vue
│   │   ├── Modal.vue
│   │   ├── Input.vue
│   │   └── Select.vue
│   │
│   ├── forms/                       # Form-specific components
│   │   ├── FormField.vue
│   │   ├── FormSelect.vue
│   │   └── FormCheckbox.vue
│   │
│   ├── blocks/                      # Page blocks reutilizables
│   │   ├── HeroBlock.vue
│   │   ├── FeatureBlock.vue
│   │   ├── CTABlock.vue
│   │   └── TestimonialBlock.vue
│   │
│   └── layout/                      # Componentes de layout
│       ├── AppHeader.vue
│       └── AppFooter.vue
│
├── layouts/
│   ├── default.vue                  # Layout default
│   ├── auth.vue                     # Layout para auth
│   └── minimal.vue                  # Layout sin header/footer
│
├── pages/
│   ├── index.vue                    # Home
│   ├── about.vue
│   ├── pricing.vue
│   │
│   ├── auth/
│   │   ├── login.vue
│   │   ├── register.vue
│   │   └── forgot-password.vue
│   │
│   ├── dashboard/
│   │   ├── index.vue
│   │   ├── profile.vue
│   │   ├── settings.vue
│   │   └── [id].vue
│   │
│   ├── blog/
│   │   ├── index.vue
│   │   └── [slug].vue
│   │
│   └── [[...slug]].vue              # Fallback 404
│
├── composables/                     # Vue Composables reutilizables
│   ├── useAuth.ts
│   ├── useFetch.ts
│   ├── useValidation.ts
│   ├── useApi.ts
│   ├── useLocalStorage.ts
│   ├── useDarkMode.ts
│   └── useAnimation.ts
│
├── utils/
│   ├── api.ts                       # API client
│   ├── validators.ts                # Validaciones (zod/valibot)
│   ├── formatters.ts                # Formateo de datos
│   ├── constants.ts                 # Constantes globales
│   └── helpers.ts                   # Funciones utilidades
│
├── server/
│   ├── api/
│   │   ├── auth/
│   │   │   └── login.post.ts
│   │   ├── users/
│   │   │   ├── index.get.ts
│   │   │   └── [id].get.ts
│   │   └── [...].ts                # Fallback endpoint
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── cors.ts
│   │   └── logger.ts
│   │
│   ├── routes/
│   │   └── sitemap.xml.ts          # Generación dinámica
│   │
│   └── utils/
│       └── db.ts                    # Conexiones DB, etc
│
├── locales/
│   ├── es.json                      # Español
│   ├── en.json                      # Inglés
│   ├── pt.json                      # Portugués
│   └── fr.json                      # Francés (escalable)
│
├── stores/                          # Pinia stores (si se usa)
│   ├── auth.ts
│   ├── ui.ts
│   └── cache.ts
│
├── plugins/
│   ├── init.ts                      # Inicialización global
│   └── error-handler.ts             # Error handling
│
├── middleware/
│   ├── auth.ts                      # Guard para rutas protegidas
│   └── log.ts                       # Logging middleware
│
├── .env.example
├── .env.local
├── .env.production
│
├── package.json
├── pnpm-lock.yaml
│
└── README.md
```

---

## ⚙️ Configuración Inicial

### 1. nuxt.config.ts

```typescript
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // Module Configuration
  modules: [
    '@nuxt/ui',
    '@nuxt/i18n',
    '@nuxt/icon',
    '@nuxt/image',
    'nuxt-gtag',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
  ],

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: 'build',
  },

  // SSR & Rendering
  ssr: true,
  experimental: {
    payloadExtraction: false,
    renderJsonPayload: true,
  },

  // Nuxt UI Configuration
  ui: {
    icons: ['heroicons', 'lucide'],
    safelistColors: ['red', 'orange', 'amber', 'yellow', 'lime', 'green'],
  },

  // i18n Configuration
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      { code: 'es', iso: 'es-ES', name: 'Español' },
      { code: 'en', iso: 'en-US', name: 'English' },
      { code: 'pt', iso: 'pt-BR', name: 'Português' },
      { code: 'fr', iso: 'fr-FR', name: 'Français' },
    ],
    defaultLocale: 'es',
    vueI18n: './i18n.config.ts',
    precompile: {
      messages: true,
      modifiers: true,
    },
  },

  // Image Configuration
  image: {
    format: ['webp', 'avif'],
    quality: 80,
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  // CSS Global
  css: [
    '~/assets/css/variables.css',
    '~/assets/css/main.css',
  ],

  // Directivas Auto-Import
  components: {
    dirs: [
      {
        path: '~/components/common',
        pathPrefix: false,
      },
      {
        path: '~/components/ui',
        pathPrefix: false,
      },
      {
        path: '~/components/blocks',
        pathPrefix: false,
      },
    ],
  },

  // Composables Auto-Import
  imports: {
    dirs: ['./composables', './utils'],
  },

  // Build Configuration
  build: {
    transpile: ['@formkit/auto-animate'],
  },

  // Runtime Config
  runtimeConfig: {
    apiSecret: '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
  },

  // Development Server
  devServer: {
    host: 'localhost',
    port: 3000,
  },

  // Nitro (Server)
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml', '/robots.txt'],
    },
  },

  // Google Analytics
  gtag: {
    id: process.env.NUXT_PUBLIC_GTAG_ID,
    config: {
      page_path_reporter: 'pageLocationPath',
    },
  },

  // SEO & Sitemap
  sitemap: {
    strictNuxtContentPaths: true,
  },

  robots: {
    rules: {
      UserAgent: '*',
      Allow: '/',
    },
  },

  // App Configuration
  app: {
    head: {
      htmlAttrs: {
        lang: 'es',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'icon', href: '/favicon.ico' },
      ],
    },
  },
})
```

### 2. tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: 'rgb(var(--color-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
} satisfies Config
```

### 3. i18n.config.ts

```typescript
export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'es',
  messages: {
    es: {
      nav: {
        home: 'Inicio',
        about: 'Acerca de',
        contact: 'Contacto',
      },
      errors: {
        notFound: 'No encontrado',
        serverError: 'Error del servidor',
      },
    },
    en: {
      nav: {
        home: 'Home',
        about: 'About',
        contact: 'Contact',
      },
      errors: {
        notFound: 'Not found',
        serverError: 'Server error',
      },
    },
  },
}))
```

---

## 📏 Estándares de Código

### Vue SFC Style

```vue
<template>
  <section class="space-y-6">
    <h2 class="text-2xl font-bold">{{ title }}</h2>
    <p class="text-gray-600">{{ description }}</p>
    
    <UButton 
      @click="handleClick"
      :loading="isLoading"
    >
      {{ $t('actions.submit') }}
    </UButton>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'

interface Props {
  title: string
  description: string
  onSubmit?: () => Promise<void>
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
})

const emit = defineEmits<{
  submit: [value: string]
  cancel: []
}>()

const { t } = useI18n()
const isLoading = ref(false)

const handleClick = async () => {
  try {
    isLoading.value = true
    emit('submit', props.title)
    
    if (props.onSubmit) {
      await props.onSubmit()
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="postcss">
/* Usa variables de Tailwind */
</style>
```

### Naming Conventions

```typescript
// Componentes: PascalCase
Header.vue
UserProfile.vue
FormInput.vue

// Archivos composables: camelCase con prefijo 'use'
useAuth.ts
useFetch.ts
useLocalStorage.ts

// Archivos utils: camelCase
apiClient.ts
validators.ts
formatters.ts

// Constantes: UPPER_SNAKE_CASE
const API_TIMEOUT = 30000
const MAX_FILE_SIZE = 5242880

// Variables/Funciones: camelCase
const userData = ref({})
const fetchUserData = async () => {}

// CSS classes: kebab-case
class="btn-primary"
class="card-container"
```

### TypeScript Best Practices

```typescript
// ✓ Siempre usar type-safe
interface UserResponse {
  id: string
  email: string
  role: 'admin' | 'user' | 'guest'
  createdAt: Date
}

// ✓ Usar Zod/Valibot para validación
import { z } from 'zod'

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'user', 'guest']),
})

type User = z.infer<typeof UserSchema>

// ✓ Evitar 'any'
// ✗ const data: any = await api.get('/users')
// ✓ const data: UserResponse[] = await api.get('/users')

// ✓ Usar utility types
type ReadonlyUser = Readonly<User>
type PartialUser = Partial<User>
type UserKeys = keyof User
```

---

## 🎭 Patrones y Convenciones

### Composable Pattern

```typescript
// composables/useAuth.ts
export const useAuth = () => {
  const router = useRouter()
  const { $fetch } = useNuxtApp()
  
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => user.value !== null)
  const isLoading = ref(false)
  
  const login = async (email: string, password: string) => {
    try {
      isLoading.value = true
      const response = await $fetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      
      user.value = response.user
      navigateTo('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }
  
  const logout = () => {
    user.value = null
    navigateTo('/')
  }
  
  return {
    user: readonly(user),
    isAuthenticated,
    isLoading,
    login,
    logout,
  }
}
```

### API Composable Pattern

```typescript
// composables/useFetch.ts
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers?: Record<string, string>
}

export const useFetch = <T = any>(
  url: string,
  options: FetchOptions = {}
) => {
  const { $fetch } = useNuxtApp()
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const pending = ref(false)
  
  const execute = async () => {
    try {
      pending.value = true
      error.value = null
      data.value = await $fetch<T>(url, {
        method: options.method || 'GET',
        headers: options.headers,
      })
    } catch (e) {
      error.value = e instanceof Error ? e : new Error(String(e))
    } finally {
      pending.value = false
    }
  }
  
  onMounted(() => {
    execute()
  })
  
  return {
    data: readonly(data),
    error: readonly(error),
    pending: readonly(pending),
    execute,
  }
}
```

### Middleware Pattern

```typescript
// middleware/auth.ts
export default defineRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth()
  
  // Proteger rutas requiriendo autenticación
  if (to.meta.requiresAuth && !isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
  
  // Prevenir que usuarios autenticados vayan a login
  if (to.path === '/auth/login' && isAuthenticated.value) {
    return navigateTo('/dashboard')
  }
})
```

### Plugin Pattern

```typescript
// plugins/error-handler.ts
export default defineNuxtPlugin(() => {
  const router = useRouter()
  
  // Global error handler
  const handleError = (error: any) => {
    console.error('Global error:', error)
    
    if (error.statusCode === 401) {
      navigateTo('/auth/login')
    } else if (error.statusCode === 403) {
      navigateTo('/403')
    } else if (error.statusCode === 404) {
      navigateTo('/404')
    }
  }
  
  return {
    provide: {
      handleError,
    },
  }
})
```

---

## 🔧 Composables Reutilizables

### useValidation.ts

```typescript
import { z } from 'zod'

export const useValidation = () => {
  const validate = <T>(schema: z.ZodSchema, data: any): T => {
    try {
      return schema.parse(data) as T
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join(', ')
        )
      }
      throw error
    }
  }
  
  const validateAsync = async <T>(
    schema: z.ZodSchema,
    data: any
  ): Promise<T> => {
    try {
      return await schema.parseAsync(data) as T
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join(', ')
        )
      }
      throw error
    }
  }
  
  return { validate, validateAsync }
}
```

### useApi.ts

```typescript
export const useApi = () => {
  const config = useRuntimeConfig()
  const { $fetch } = useNuxtApp()
  
  const api = $fetch.create({
    baseURL: config.public.apiBase,
    onRequest({ request, options }) {
      const token = useAuthStore().token
      if (token) {
        options.headers = options.headers || {}
        options.headers.Authorization = `Bearer ${token}`
      }
    },
    onResponseError({ response }) {
      if (response.status === 401) {
        navigateTo('/auth/login')
      }
    },
  })
  
  return { api }
}
```

### useLocalStorage.ts

```typescript
export const useLocalStorage = <T = any>(key: string, defaultValue: T) => {
  const value = ref<T>(defaultValue)
  
  // Inicializar desde localStorage
  if (process.client) {
    const stored = localStorage.getItem(key)
    if (stored) {
      try {
        value.value = JSON.parse(stored)
      } catch (e) {
        console.error(`Failed to parse localStorage key: ${key}`, e)
      }
    }
  }
  
  // Watchers para sincronizar
  watch(value, (newVal) => {
    if (process.client) {
      localStorage.setItem(key, JSON.stringify(newVal))
    }
  }, { deep: true })
  
  const clear = () => {
    value.value = defaultValue
    if (process.client) {
      localStorage.removeItem(key)
    }
  }
  
  return { value, clear }
}
```

---

## 🌍 Internacionalización

### Estructura de Locales

```
locales/
├── es.json
├── en.json
├── pt.json
└── fr.json
```

### locales/es.json

```json
{
  "nav": {
    "home": "Inicio",
    "about": "Acerca de",
    "contact": "Contacto"
  },
  "common": {
    "loading": "Cargando...",
    "error": "Ocurrió un error",
    "success": "¡Éxito!",
    "cancel": "Cancelar",
    "submit": "Enviar",
    "delete": "Eliminar",
    "edit": "Editar",
    "save": "Guardar"
  },
  "auth": {
    "login": "Iniciar sesión",
    "logout": "Cerrar sesión",
    "register": "Registrarse",
    "email": "Correo electrónico",
    "password": "Contraseña"
  },
  "errors": {
    "notFound": "No encontrado",
    "unauthorized": "No autorizado",
    "serverError": "Error del servidor",
    "networkError": "Error de conexión"
  }
}
```

### Uso en Componentes

```vue
<template>
  <div>
    <!-- String simple -->
    <h1>{{ $t('nav.home') }}</h1>
    
    <!-- Con interpolación -->
    <p>{{ $t('welcome', { name: userName }) }}</p>
    
    <!-- Pluralización -->
    <p>{{ $tc('items', itemCount) }}</p>
    
    <!-- Cambiar idioma -->
    <UButton 
      v-for="locale in locales"
      :key="locale.code"
      @click="setLocale(locale.code)"
    >
      {{ locale.name }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
const { t, locale } = useI18n()
const locales = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
]

const setLocale = (newLocale: string) => {
  locale.value = newLocale
  navigateTo(
    `/${newLocale}${useRoute().path.replace(/^\/(es|en|pt|fr)/, '')}`
  )
}
</script>
```

---

## 🖼️ Optimización de Imágenes

### Implementación con @nuxt/image

```vue
<template>
  <!-- Image simple -->
  <NuxtImg
    src="/images/hero.jpg"
    alt="Hero image"
    width="1200"
    height="600"
    quality="80"
    format="webp"
  />
  
  <!-- Image responsiva -->
  <NuxtImg
    src="/images/feature.jpg"
    alt="Feature"
    sizes="sm:100vw md:50vw lg:400px"
    :preload="true"
  />
  
  <!-- Picture con fallbacks -->
  <picture>
    <source
      srcset="/images/image.avif"
      type="image/avif"
    >
    <source
      srcset="/images/image.webp"
      type="image/webp"
    >
    <NuxtImg
      src="/images/image.jpg"
      alt="Fallback"
    />
  </picture>
</template>
```

### Configuración de Providers

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  image: {
    // Provider local
    provider: 'ipx',
    
    // O usar provider externo (Cloudinary, etc)
    // provider: 'cloudinary',
    // cloudinary: {
    //   baseURL: 'https://res.cloudinary.com/your-cloud/image/upload/',
    // },
    
    format: ['webp', 'avif'],
    quality: 80,
    presets: {
      thumbnail: {
        modifiers: {
          width: 300,
          height: 300,
          fit: 'crop',
        },
      },
      hero: {
        modifiers: {
          width: 1920,
          height: 1080,
          quality: 90,
        },
      },
    },
  },
})
```

---

## 📋 Formularios

### Con @formkit/auto-animate

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <!-- Input con auto-animate -->
    <div class="space-y-4">
      <UFormGroup label="Email">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="tu@email.com"
          @focus="animateField('email')"
        />
      </UFormGroup>
      
      <UFormGroup label="Contraseña">
        <UInput
          v-model="form.password"
          type="password"
          @focus="animateField('password')"
        />
      </UFormGroup>
    </div>
    
    <!-- Error animation -->
    <Transition name="slide-fade">
      <div v-if="error" class="text-red-500 text-sm mt-2">
        {{ error }}
      </div>
    </Transition>
    
    <UButton type="submit" :loading="isSubmitting">
      {{ $t('common.submit') }}
    </UButton>
  </form>
</template>

<script setup lang="ts">
import { autoAnimate } from '@formkit/auto-animate'

const form = reactive({
  email: '',
  password: '',
})

const error = ref('')
const isSubmitting = ref(false)

const animateField = (field: string) => {
  // Triggering animations with auto-animate
  const el = document.querySelector(`[data-field="${field}"]`)
  if (el) {
    autoAnimate(el)
  }
}

const handleSubmit = async () => {
  error.value = ''
  isSubmitting.value = true
  
  try {
    // Validar
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
    })
    
    const validated = schema.parse(form)
    
    // Enviar
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: validated,
    })
    
    navigateTo('/dashboard')
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Error desconocido'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(-10px);
  opacity: 0;
}
</style>
```

---

## 🎨 UI y Theming

### Dark Mode Setup

```typescript
// composables/useDarkMode.ts
export const useDarkMode = () => {
  const colorMode = useColorMode()
  
  const isDark = computed({
    get: () => colorMode.value === 'dark',
    set: (value) => {
      colorMode.preference = value ? 'dark' : 'light'
    },
  })
  
  return {
    isDark,
    toggle: () => {
      isDark.value = !isDark.value
    },
  }
}
```

### CSS Variables

```css
/* assets/css/variables.css */
:root {
  --color-primary: 59 130 246; /* Blue */
  --color-secondary: 107 114 128; /* Gray */
  --color-accent: 236 72 153; /* Pink */
  
  --color-success: 34 197 94;
  --color-warning: 251 146 60;
  --color-error: 239 68 68;
  --color-info: 59 130 246;
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: 96 165 250;
    --color-secondary: 156 163 175;
  }
}
```

---

## ⚡ Performance

### Best Practices

```typescript
// 1. Code Splitting - Componentes lazy
const LazyComponent = defineAsyncComponent(
  () => import('~/components/Heavy.vue')
)

// 2. Route-based Code Splitting (automático en Nuxt)
// pages/dashboard.vue se carga solo cuando se navega

// 3. Composable con Lazy Loading
const useLazyUser = () => {
  const user = ref(null)
  
  const load = async () => {
    user.value = await $fetch('/api/user')
  }
  
  return { user, load }
}

// 4. Image Optimization (automático con @nuxt/image)

// 5. Preload Critical Resources
export default defineNuxtConfig({
  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml'],
      ignore: ['/admin'],
    },
  },
})

// 6. Tree-shaking friendly imports
import { reactive } from 'vue' // ✓ ES6
const Vue = require('vue') // ✗ CommonJS
```

### Monitoreo de Performance

```typescript
// plugins/performance.ts
export default defineNuxtPlugin(() => {
  if (process.client && typeof window !== 'undefined') {
    window.addEventListener('load', () => {
      const perfData = window.performance.timing
      const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart
      
      console.log(`Page Load Time: ${pageLoadTime}ms`)
      
      // Enviar a analytics
      gtag.pageview({
        page_title: document.title,
        page_path: window.location.pathname,
      })
    })
  }
})
```

---

## ✅ Testing

### Estructura de Tests

```
tests/
├── unit/
│   ├── composables/
│   │   └── useAuth.spec.ts
│   └── utils/
│       └── validators.spec.ts
├── e2e/
│   ├── auth.spec.ts
│   └── dashboard.spec.ts
└── vitest.config.ts
```

### Test Example

```typescript
// tests/unit/composables/useAuth.spec.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuth } from '~/composables/useAuth'

describe('useAuth composable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with null user', () => {
    const { user } = useAuth()
    expect(user.value).toBeNull()
  })

  it('should login successfully', async () => {
    const { login, user } = useAuth()
    
    await login('test@example.com', 'password123')
    
    expect(user.value).toBeDefined()
    expect(user.value?.email).toBe('test@example.com')
  })

  it('should logout', () => {
    const { logout, user } = useAuth()
    
    logout()
    
    expect(user.value).toBeNull()
  })
})
```

### package.json

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  },
  "devDependencies": {
    "vitest": "^latest",
    "@vitest/ui": "^latest",
    "happy-dom": "^latest",
    "@testing-library/vue": "^latest"
  }
}
```

---

## 🚀 Deployment en Netlify

### netlify.toml

```toml
[build]
# Comando de build
command = "pnpm run build"

# Directorio a deployar
publish = ".output/public"

# Node version
node_version = "20.x"

# Environment variables
[build.environment]
NUXT_PUBLIC_API_BASE = "https://api.example.com"
NUXT_PUBLIC_SITE_URL = "https://example.com"

# Funciones Edge (Netlify Edge Functions)
[functions]
directory = "netlify/functions"
node_bundler = "esbuild"

# Redirects y Rewrites
[[redirects]]
# Para SSR: redirigir todas las rutas a la función de Nuxt
from = "/*"
to = "/.netlify/functions/index"
status = 200

# API passthrough
[[redirects]]
from = "/api/*"
to = "https://api.example.com/:splat"
status = 200
force = false

# Headers
[[headers]]
for = "/*"
[headers.values]
X-Content-Type-Options = "nosniff"
X-Frame-Options = "DENY"
X-XSS-Protection = "1; mode=block"
Referrer-Policy = "strict-origin-when-cross-origin"

# Cache control para assets
[[headers]]
for = "/_nuxt/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
for = "/fonts/*"
[headers.values]
Cache-Control = "public, max-age=31536000, immutable"

# Imágenes optimizadas
[[headers]]
for = "/images/*"
[headers.values]
Cache-Control = "public, max-age=86400"

# Rate limiting
[[headers]]
for = "/api/*"
[headers.values]
X-Robots-Tag = "noindex"

# Sitemaps y robots.txt
[[headers]]
for = "/sitemap.xml"
[headers.values]
Cache-Control = "public, max-age=3600"

[[headers]]
for = "/robots.txt"
[headers.values]
Cache-Control = "public, max-age=3600"

# Context de Staging
[context.deploy-preview]
command = "pnpm run build"
publish = ".output/public"
environment = { NUXT_PUBLIC_API_BASE = "https://staging-api.example.com" }

[context.branch-deploy]
command = "pnpm run build"
publish = ".output/public"
environment = { NUXT_PUBLIC_API_BASE = "https://staging-api.example.com" }

[context.production]
command = "pnpm run build && pnpm run test"
publish = ".output/public"
environment = { NUXT_PUBLIC_API_BASE = "https://api.example.com" }
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build",
    "preview": "nuxt preview",
    "typecheck": "nuxi typecheck",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "generate": "nuxt generate"
  }
}
```

### Configuración de Nuxt para Netlify

```typescript
// nuxt.config.ts - Añadir configuración específica de Netlify

export default defineNuxtConfig({
  // ... configuración anterior ...

  // Output configuration para Netlify
  nitro: {
    output: {
      dir: '.output',
      public: '.output/public',
    },
    prerender: {
      crawlLinks: true,
      routes: [
        '/sitemap.xml',
        '/robots.txt',
        '/',
      ],
      // Ignorar rutas dinámicas que requieren parámetros
      ignore: ['/admin', '/dashboard'],
    },
    // Netlify Edge Functions
    storage: {
      redis: {
        driver: 'netlify-redis',
      },
    },
  },

  // Redirects para Nuxt SSR en Netlify
  routeRules: {
    // Cache pages estáticas
    '/': { cache: { maxAge: 60 * 10 } },
    '/about': { cache: { maxAge: 60 * 60 } },
    
    // SWR - Stale While Revalidate
    '/blog/**': { swr: 3600 },
    
    // ISR - Incremental Static Regeneration
    '/products/**': { cache: { maxAge: 60, staleMaxAge: 120 } },
    
    // Rutas dinámicas sin cache
    '/dashboard/**': { cache: false },
    '/api/**': { cache: false },
  },

  // Headers adicionales
  app: {
    head: {
      // ... configuración anterior ...
      meta: [
        // ... otros metas ...
        {
          name: 'theme-color',
          content: '#ffffff',
        },
      ],
    },
  },
})
```

### Estructura para Netlify Functions (Opcional)

Si necesitas funciones serverless en Netlify:

```
netlify/
└── functions/
    ├── api.ts              # Proxy para API
    ├── webhook.ts          # Webhooks
    └── image-transform.ts  # Transformación de imágenes
```

```typescript
// netlify/functions/api.ts
import type { Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    
    const response = await fetch('https://api.example.com/endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.API_SECRET}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    }
  }
}

export { handler }
```

### Redirecciones para URLs amigables

```toml
# En netlify.toml - Ejemplos adicionales

# Redirecciones de landing pages
[[redirects]]
from = "/promocion"
to = "/landing/promo"
status = 301

[[redirects]]
from = "/get-started"
to = "/auth/register"
status = 301

# Redirecciones de documentación
[[redirects]]
from = "/docs/*"
to = "/documentation/:splat"
status = 301

# Catchall para 404
[[redirects]]
from = "/*"
to = "/404"
status = 404
```

### GitHub Actions - Deploy a Netlify

```yaml
# .github/workflows/deploy-netlify.yml
name: Deploy to Netlify

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - uses: pnpm/action-setup@v2
        with:
          version: latest
      
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Type checking
        run: pnpm run typecheck
      
      - name: Linting
        run: pnpm run lint
      
      - name: Tests
        run: pnpm run test
      
      - name: Build
        run: pnpm run build
        env:
          NUXT_PUBLIC_API_BASE: ${{ secrets.NUXT_PUBLIC_API_BASE }}
          NUXT_PUBLIC_SITE_URL: ${{ secrets.NUXT_PUBLIC_SITE_URL }}
      
      - name: Deploy to Netlify
        uses: netlify/actions/build@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
```

### Variables de Entorno en Netlify

En **Netlify Dashboard → Site Settings → Build & Deploy → Environment**:

```
NUXT_PUBLIC_API_BASE = https://api.example.com
NUXT_PUBLIC_SITE_URL = https://neurofit-ia.netlify.app
API_SECRET = your-secret-key
DATABASE_URL = your-db-connection-string
```

### Monitoreo y Logs

```typescript
// plugins/netlify-analytics.ts
export default defineNuxtPlugin(() => {
  if (process.client && window.netlifyIdentity) {
    window.netlifyIdentity.on('init', (user) => {
      if (!user) {
        window.netlifyIdentity.on('login', () => {
          // Usuario logueado
        })
      }
    })
  }
})
```

### Pre-deploy Checklist para Netlify

- [ ] `netlify.toml` configurado correctamente
- [ ] Variables de entorno configuradas en Netlify Dashboard
- [ ] Build local successful: `pnpm run build`
- [ ] Preview local: `pnpm run preview`
- [ ] Redirecciones testadas
- [ ] Headers de seguridad incluidos
- [ ] Cache policies configuradas
- [ ] Sitemap y robots.txt generados
- [ ] Tests pasando: `pnpm run test`
- [ ] TypeScript sin errores: `pnpm run typecheck`
- [ ] Build time dentro de límites (< 15 min)
- [ ] Tamaño del deploy < 500MB

### Troubleshooting Netlify

**Problem: Build falla con "out of memory"**
```
Solución: Aumentar el tamaño de build en netlify.toml
[build]
command = "pnpm run build"
functions = "netlify/functions"
node_version = "20.x"
```

**Problem: Rutas SSR no funcionan**
```
Verificar que .output/server está incluido
Revisar netlify.toml redirects
```

**Problem: Variables de entorno no leen**
```
Usar prefijo NUXT_PUBLIC_ para variables públicas
Otras variables deben ser accesibles vía process.env en server
```

---

## 📝 Checklist de Calidad

### Pre-Commit

- [ ] TypeScript sin errores (`pnpm run typecheck`)
- [ ] Linting pasado (`pnpm run lint`)
- [ ] Tests pasando (`pnpm run test`)
- [ ] Componentes documentados
- [ ] i18n strings añadidos a todas las locales

### Pre-Deploy

- [ ] Build sin warnings (`pnpm run build`)
- [ ] Performance audit completado
- [ ] SEO validado
- [ ] Mobile responsive testado
- [ ] Accesibilidad verificada (axe, lighthouse)
- [ ] Environment variables configuradas

---

## 🔗 Referencias

- [Nuxt 4 Documentation](https://nuxt.com/docs)
- [@nuxt/ui Components](https://ui.nuxt.com)
- [@nuxt/i18n](https://i18n.nuxtjs.org)
- [@nuxt/image](https://image.nuxt.com)
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 📞 Soporte y Contacto

Para preguntas o reportes de bugs:

1. Revisar la documentación oficial
2. Buscar en Issues existentes
3. Crear un Issue con contexto detallado
4. Contactar al equipo de desarrollo

---

**Última actualización:** Julio 2026  
**Versión del documento:** 1.0  
**Autor:** Equipo de Desarrollo Senior