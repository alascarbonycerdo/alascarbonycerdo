<script setup lang="ts">
const props = defineProps<{ isAdmin: boolean }>()

const route = useRoute()

interface NavItem {
  to: string
  icon: string
  label: string
  adminOnly?: boolean
  /** Marca activo también las subrutas (ej: el detalle de un punto de venta). */
  matchPrefix?: boolean
}

const allItems: NavItem[] = [
  { to: '/dashboard', icon: 'lucide:house', label: 'Home' },
  { to: '/dashboard/pedidos', icon: 'lucide:shopping-cart', label: 'Pedidos' },
  { to: '/dashboard/inventario', icon: 'lucide:boxes', label: 'Inventario' },
  { to: '/dashboard/usuarios', icon: 'lucide:users', label: 'Usuarios', adminOnly: true },
  { to: '/dashboard/puntos-venta', icon: 'lucide:store', label: 'Puntos', adminOnly: true, matchPrefix: true },
  { to: '/dashboard/facturas', icon: 'lucide:receipt', label: 'Facturas', adminOnly: true },
  { to: '/', icon: 'lucide:flame', label: 'Menú' },
]

const items = computed(() => allItems.filter((item) => !item.adminOnly || props.isAdmin))

const isActive = (item: NavItem) =>
  item.matchPrefix ? route.path.startsWith(item.to) : route.path === item.to

const scroller = ref<HTMLElement | null>(null)
const canScrollLeft = ref(false)
const canScrollRight = ref(false)

const updateArrows = () => {
  const el = scroller.value
  if (!el) return
  // 1px de tolerancia: el scroll fraccionado nunca llega al extremo exacto.
  canScrollLeft.value = el.scrollLeft > 1
  canScrollRight.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 1
}

const nudge = (direction: 1 | -1) => {
  const el = scroller.value
  if (!el) return
  el.scrollBy({ left: direction * el.clientWidth * 0.65, behavior: 'smooth' })
}

/**
 * Centra el ítem activo. Mueve solo el scrollLeft del carrusel (no usa
 * scrollIntoView) para no arrastrar la página entera al navegar.
 */
const centerActive = (behavior: ScrollBehavior = 'smooth') => {
  const wrap = scroller.value
  const el = wrap?.querySelector<HTMLElement>('[data-active="true"]')
  if (!wrap || !el) return
  wrap.scrollTo({ left: el.offsetLeft - (wrap.clientWidth - el.clientWidth) / 2, behavior })
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  centerActive('auto')
  updateArrows()
  resizeObserver = new ResizeObserver(() => updateArrows())
  if (scroller.value) resizeObserver.observe(scroller.value)
})

onBeforeUnmount(() => resizeObserver?.disconnect())

watch(
  () => route.path,
  () => nextTick(() => {
    centerActive()
    updateArrows()
  }),
)
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-20 border-t border-gold/10 bg-ink/95 backdrop-blur">
    <div class="relative mx-auto max-w-2xl">
      <!-- Flecha izquierda -->
      <Transition name="nav-arrow">
        <button
          v-show="canScrollLeft"
          type="button"
          class="absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-start bg-gradient-to-r from-ink via-ink/95 to-transparent pl-1 text-gold-soft/70 transition hover:text-gold active:scale-90"
          aria-label="Desplazar a la izquierda"
          @click="nudge(-1)"
        >
          <Icon name="lucide:chevron-left" class="size-5" />
        </button>
      </Transition>

      <div
        ref="scroller"
        class="nav-scroller flex items-stretch gap-1 overflow-x-auto scroll-smooth px-10 py-2"
        @scroll.passive="updateArrows"
      >
        <NuxtLink
          v-for="item in items"
          :key="item.to"
          :to="item.to"
          :data-active="isActive(item)"
          class="group relative flex shrink-0 flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition-all duration-300 ease-out active:scale-90"
          :class="
            isActive(item)
              ? 'bg-gold/10 text-gold ring-1 ring-gold/25'
              : 'text-gold-soft/60 hover:bg-gold/5 hover:text-gold-soft'
          "
        >
          <Icon
            :name="item.icon"
            class="size-5 transition-transform duration-300 ease-out"
            :class="isActive(item) ? 'scale-110' : 'group-hover:scale-105'"
          />
          {{ item.label }}
          <span
            class="absolute -bottom-0.5 h-0.5 rounded-full bg-gold transition-all duration-300 ease-out"
            :class="isActive(item) ? 'w-6 opacity-100' : 'w-0 opacity-0'"
          />
        </NuxtLink>
      </div>

      <!-- Flecha derecha -->
      <Transition name="nav-arrow">
        <button
          v-show="canScrollRight"
          type="button"
          class="absolute inset-y-0 right-0 z-10 flex w-11 items-center justify-end bg-gradient-to-l from-ink via-ink/95 to-transparent pr-1 text-gold-soft/70 transition hover:text-gold active:scale-90"
          aria-label="Desplazar a la derecha"
          @click="nudge(1)"
        >
          <Icon name="lucide:chevron-right" class="size-5" />
        </button>
      </Transition>
    </div>
  </nav>
</template>

<style scoped>
/* La barra de scroll nativa rompe la estética; el desplazamiento se guía con
   las flechas y el gesto táctil. */
.nav-scroller {
  scrollbar-width: none;
  -ms-overflow-style: none;
  overscroll-behavior-x: contain;
}

.nav-scroller::-webkit-scrollbar {
  display: none;
}

.nav-arrow-enter-active,
.nav-arrow-leave-active {
  transition: opacity 200ms ease-out;
}

.nav-arrow-enter-from,
.nav-arrow-leave-to {
  opacity: 0;
}

/* Respeta a quien pidió menos animación en el sistema. */
@media (prefers-reduced-motion: reduce) {
  .nav-scroller {
    scroll-behavior: auto;
  }
}
</style>
