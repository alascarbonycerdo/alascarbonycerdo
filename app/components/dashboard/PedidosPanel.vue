<script setup lang="ts">
import { porkItems, wingsCombos } from '#shared/utils/menu'
import { formatCOP } from '#shared/utils/format'

const dishes = [...wingsCombos, ...porkItems]

const { todayPedidos, registerPedido, todayRevenueThousands, todayItemsSold } = useDashboard()

const quantities = reactive<Record<string, number>>({})
const qty = (id: string) => quantities[id] ?? 0
const increment = (id: string) => (quantities[id] = qty(id) + 1)
const decrement = (id: string) => (quantities[id] = Math.max(0, qty(id) - 1))
const clearCart = () => dishes.forEach((dish) => (quantities[dish.id] = 0))

const cart = computed(() =>
  dishes
    .filter((dish) => qty(dish.id) > 0)
    .map((dish) => ({ dish, cantidad: qty(dish.id), subtotal: dish.priceThousands * qty(dish.id) })),
)
const cartTotal = computed(() => cart.value.reduce((sum, entry) => sum + entry.subtotal, 0))
const cartCount = computed(() => cart.value.reduce((sum, entry) => sum + entry.cantidad, 0))

const submitting = ref(false)
const error = ref('')

/** Un solo pedido con todos los platos que estén en el carrito. */
const submitCart = async () => {
  if (!cart.value.length) return
  error.value = ''
  submitting.value = true
  try {
    await registerPedido(cart.value.map((entry) => ({ dishId: entry.dish.id, cantidad: entry.cantidad })))
    clearCart()
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo crear el pedido'
  } finally {
    submitting.value = false
  }
}

const sortedPedidos = computed(() => [...todayPedidos.value].sort((a, b) => b.time.localeCompare(a.time)))
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-gold">Pedidos de hoy</h2>
      <div class="flex gap-2">
        <StatTile label="Ítems" :value="String(todayItemsSold)" />
        <StatTile label="Total" :value="formatCOP(todayRevenueThousands)" />
      </div>
    </div>

    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>

    <div class="grid gap-2">
      <div
        v-for="dish in dishes"
        :key="dish.id"
        class="flex items-center justify-between gap-3 rounded-2xl bg-ink-soft/60 px-4 py-3 ring-1 ring-gold/10"
      >
        <div>
          <p class="font-display text-base leading-tight text-gold">{{ dish.name }}</p>
          <p class="text-xs text-gold-soft/60">{{ dish.priceThousands }} MIL / unidad</p>
        </div>
        <QuantityStepper :qty="qty(dish.id)" @increment="increment(dish.id)" @decrement="decrement(dish.id)" />
      </div>
    </div>

    <div v-if="cart.length" class="space-y-2 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <div class="flex items-center justify-between">
        <p class="text-xs uppercase tracking-widest text-gold-soft/60">Pedido en curso</p>
        <button type="button" class="text-xs text-gold-soft/60 transition hover:text-gold" @click="clearCart">
          Vaciar
        </button>
      </div>
      <ul class="space-y-1 text-sm">
        <li v-for="entry in cart" :key="entry.dish.id" class="flex items-center justify-between text-gold-soft">
          <span>{{ entry.cantidad }} x {{ entry.dish.name }}</span>
          <span class="font-semibold text-gold">{{ formatCOP(entry.subtotal) }}</span>
        </li>
      </ul>
      <div class="flex items-center justify-between border-t border-gold/10 pt-2 text-sm font-semibold">
        <span class="text-gold-soft">Total</span>
        <span class="text-gold">{{ formatCOP(cartTotal) }}</span>
      </div>
      <button
        type="button"
        class="relative w-full rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-40"
        :disabled="submitting"
        @click="submitCart"
      >
        <span :class="{ invisible: submitting }">Crear pedido · {{ cartCount }} platos</span>
        <span v-if="submitting" class="absolute inset-0 flex items-center justify-center">
          <span class="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
        </span>
      </button>
    </div>

    <div class="space-y-2">
      <p class="text-xs uppercase tracking-widest text-gold-soft/60">Registro del día</p>
      <p v-if="!sortedPedidos.length" class="text-sm text-gold-soft/50">Aún no hay pedidos hoy.</p>
      <ul v-else class="divide-y divide-gold/10 overflow-hidden rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10">
        <li v-for="pedido in sortedPedidos" :key="pedido.id" class="px-4 py-2.5 text-sm">
          <div class="flex items-center justify-between gap-3">
            <span class="text-gold-soft/60">{{ pedido.time }}</span>
            <span class="flex-1 px-3">
              <span class="text-gold-soft">
                {{ pedido.items.map((item) => `${item.cantidad} x ${item.dishNombre}`).join(' · ') }}
              </span>
              <span v-if="pedido.responsableNombre" class="block text-[0.65rem] text-gold-soft/50">
                {{ pedido.responsableNombre }}
              </span>
            </span>
            <span class="font-semibold text-gold">{{ formatCOP(pedido.totalMiles) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
