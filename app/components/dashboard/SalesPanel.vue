<script setup lang="ts">
import { porkItems, wingsCombos } from '#shared/utils/menu'
import { formatCOP } from '#shared/utils/format'

const dishes = [...wingsCombos, ...porkItems]

const { todaySales, registerSale, todayRevenueThousands, todayItemsSold } = useDashboard()

const quantities = reactive<Record<string, number>>({})
const qty = (id: string) => quantities[id] ?? 0
const increment = (id: string) => (quantities[id] = qty(id) + 1)
const decrement = (id: string) => (quantities[id] = Math.max(0, qty(id) - 1))

const submitting = ref<string | null>(null)

const sell = async (id: string) => {
  const amount = qty(id)
  if (!amount) return
  submitting.value = id
  try {
    await registerSale(id, amount)
    quantities[id] = 0
  } finally {
    submitting.value = null
  }
}

const formatCurrency = formatCOP

const sortedSales = computed(() => [...todaySales.value].sort((a, b) => b.time.localeCompare(a.time)))
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-gold">Ventas de hoy</h2>
      <div class="flex gap-2">
        <StatTile label="Ítems" :value="String(todayItemsSold)" />
        <StatTile label="Total" :value="formatCurrency(todayRevenueThousands)" />
      </div>
    </div>

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
        <div class="flex items-center gap-2">
          <QuantityStepper :qty="qty(dish.id)" @increment="increment(dish.id)" @decrement="decrement(dish.id)" />
          <button
            type="button"
            class="rounded-lg bg-ember px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-ember-soft disabled:opacity-30"
            :disabled="!qty(dish.id) || submitting === dish.id"
            @click="sell(dish.id)"
          >
            Vender
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-2">
      <p class="text-xs uppercase tracking-widest text-gold-soft/60">Registro del día</p>
      <p v-if="!sortedSales.length" class="text-sm text-gold-soft/50">Aún no hay ventas hoy.</p>
      <ul v-else class="divide-y divide-gold/10 overflow-hidden rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10">
        <li v-for="sale in sortedSales" :key="sale.id" class="flex items-center justify-between px-4 py-2.5 text-sm">
          <span class="text-gold-soft/60">{{ sale.time }}</span>
          <span class="flex-1 px-3 text-gold-soft">{{ sale.qty }} x {{ sale.dishName }}</span>
          <span class="font-semibold text-gold">{{ formatCurrency(sale.totalThousands) }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>
