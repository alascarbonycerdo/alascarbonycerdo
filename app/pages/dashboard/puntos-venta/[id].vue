<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'
import type { InventoryItem, DaySummary, SaleRecord } from '#shared/types/dashboard'

definePageMeta({ middleware: ['staff', 'admin'], layout: 'dashboard' })

const route = useRoute()
const puntoVentaId = route.params.id as string

const { puntos, load: loadPuntos } = usePuntosVenta()
const punto = computed(() => puntos.value.find((p) => p.id === puntoVentaId))

const requestFetch = useRequestFetch()

const inventory = ref<InventoryItem[]>([])
const sales = ref<SaleRecord[]>([])
const weeklySummary = ref<DaySummary[]>([])
const pending = ref(false)
const error = ref<string | null>(null)

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())

const loadDetail = async () => {
  pending.value = true
  error.value = null
  try {
    const [inventoryRes, salesRes, summaryRes] = await Promise.all([
      requestFetch<InventoryItem[]>('/api/dashboard/inventory', { query: { puntoVentaId } }),
      requestFetch<SaleRecord[]>('/api/dashboard/sales', { query: { date: today, puntoVentaId } }),
      requestFetch<DaySummary[]>('/api/dashboard/summary', { query: { days: 7, puntoVentaId } }),
    ])
    inventory.value = inventoryRes
    sales.value = salesRes
    weeklySummary.value = summaryRes
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No se pudo cargar el panel de este punto de venta'
  } finally {
    pending.value = false
  }
}

await useAsyncData(`punto-venta-detail-${puntoVentaId}`, () => Promise.all([loadPuntos(), loadDetail()]))

const todayRevenueThousands = computed(() => sales.value.reduce((sum, sale) => sum + sale.totalThousands, 0))
const todayItemsSold = computed(() => sales.value.reduce((sum, sale) => sum + sale.qty, 0))
const sortedSales = computed(() => [...sales.value].sort((a, b) => b.time.localeCompare(a.time)))

const minConsumption = (item: InventoryItem) => {
  const min = Math.min(...item.dishes.map((d) => d.consumptionPerSale), Infinity)
  return Number.isFinite(min) ? min : 0
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <NuxtLink to="/dashboard/puntos-venta" class="flex items-center gap-1 text-xs font-semibold text-gold-soft/70 hover:text-gold">
          <Icon name="lucide:arrow-left" class="size-3.5" />
          Puntos de venta
        </NuxtLink>
        <h2 class="mt-1 font-display text-2xl text-gold">{{ punto?.nombre ?? 'Punto de venta' }}</h2>
        <p v-if="punto?.direccion" class="text-xs text-gold-soft/60">{{ punto.direccion }}</p>
      </div>
      <span
        v-if="punto"
        class="rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide"
        :class="punto.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ember/15 text-ember-soft'"
      >
        {{ punto.activo ? 'Activo' : 'Inactivo' }}
      </span>
    </div>

    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>

    <div class="grid grid-cols-3 gap-3">
      <StatTile label="Ventas de hoy" :value="formatCOP(todayRevenueThousands)" />
      <StatTile label="Ítems vendidos" :value="String(todayItemsSold)" />
      <StatTile
        label="Stock bajo"
        :value="String(inventory.filter((i) => i.currentStock < minConsumption(i)).length)"
        :tone="inventory.some((i) => i.currentStock < minConsumption(i)) ? 'ember' : 'gold'"
      />
    </div>

    <div class="space-y-8" :class="{ 'opacity-60': pending }">
      <section class="space-y-3">
        <h3 class="font-display text-xl text-gold">Inventario</h3>
        <div class="space-y-2">
          <div
            v-for="item in inventory"
            :key="item.id"
            class="flex items-center justify-between gap-3 rounded-2xl bg-ink-soft/60 px-4 py-3 ring-1 ring-gold/10"
          >
            <div>
              <p class="font-display text-base leading-tight text-gold">{{ item.name }}</p>
              <p v-if="item.detail" class="text-xs uppercase tracking-wider text-ember-soft">{{ item.detail }}</p>
            </div>
            <p class="text-sm font-semibold" :class="item.currentStock < minConsumption(item) ? 'text-ember-soft' : 'text-gold-soft'">
              {{ item.currentStock }} unidades
            </p>
          </div>
          <p v-if="!pending && !inventory.length" class="text-sm text-gold-soft/50">Sin insumos configurados.</p>
        </div>
      </section>

      <section class="space-y-3">
        <h3 class="font-display text-xl text-gold">Ventas de hoy</h3>
        <ul v-if="sortedSales.length" class="divide-y divide-gold/10 overflow-hidden rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10">
          <li v-for="sale in sortedSales" :key="sale.id" class="flex items-center justify-between px-4 py-2.5 text-sm">
            <span class="text-gold-soft/60">{{ sale.time }}</span>
            <span class="flex-1 px-3">
              <span class="text-gold-soft">{{ sale.qty }} x {{ sale.dishName }}</span>
              <span v-if="sale.vendedorNombre" class="block text-[0.65rem] text-gold-soft/50">{{ sale.vendedorNombre }}</span>
            </span>
            <span class="font-semibold text-gold">{{ formatCOP(sale.totalThousands) }}</span>
          </li>
        </ul>
        <p v-else-if="!pending" class="text-sm text-gold-soft/50">Aún no hay ventas hoy en este punto.</p>
      </section>

      <section class="space-y-3">
        <h3 class="font-display text-xl text-gold">Últimos 7 días</h3>
        <div class="overflow-x-auto rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10">
          <table class="w-full min-w-[420px] text-left text-xs">
            <thead>
              <tr class="text-gold-soft/60">
                <th class="px-3 py-2 font-medium">Día</th>
                <th class="px-3 py-2 font-medium">Ventas</th>
                <th class="px-3 py-2 font-medium">Ítems</th>
                <th class="px-3 py-2 font-medium">Unidades usadas</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gold/10 tabular-nums">
              <tr v-for="day in weeklySummary" :key="day.date">
                <td class="px-3 py-2 text-gold-soft">{{ day.label }}</td>
                <td class="px-3 py-2 text-gold">{{ formatCOP(day.revenueThousands) }}</td>
                <td class="px-3 py-2 text-gold-soft">{{ day.itemsSold }}</td>
                <td class="px-3 py-2 text-gold-soft">{{ day.unitsConsumed.toLocaleString('es-CO') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>
