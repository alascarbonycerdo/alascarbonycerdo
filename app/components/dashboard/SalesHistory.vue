<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'

const { date, sales, pending, error, load, removeSale } = useSalesHistory()
const { refresh: refreshDashboard } = useDashboard()

await useAsyncData('sales-history-init', () => load())

watch(date, () => load())

const deletingId = ref<string | null>(null)
const deleteError = ref('')

const remove = async (id: string) => {
  if (!confirm('¿Eliminar esta venta? El stock descontado se va a devolver al inventario.')) return
  deleteError.value = ''
  deletingId.value = id
  try {
    await removeSale(id)
    await refreshDashboard()
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'No se pudo eliminar la venta'
  } finally {
    deletingId.value = null
  }
}

const sortedSales = computed(() => [...sales.value].sort((a, b) => b.time.localeCompare(a.time)))

const total = computed(() => sales.value.reduce((sum, sale) => sum + sale.totalThousands, 0))
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-gold">Historial de ventas</h2>
      <label class="flex items-center gap-2 rounded-lg bg-ink-soft/60 px-2.5 py-1.5 ring-1 ring-gold/15">
        <Icon name="lucide:calendar" class="size-4 text-gold-soft/60" />
        <input
          v-model="date"
          type="date"
          class="bg-transparent text-sm text-gold-soft focus:outline-none [color-scheme:dark]"
        >
      </label>
    </div>

    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>
    <p v-if="deleteError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ deleteError }}</p>

    <div class="flex items-center justify-between text-xs text-gold-soft/60">
      <span>{{ sales.length }} {{ sales.length === 1 ? 'venta' : 'ventas' }}</span>
      <span class="font-semibold text-gold">{{ formatCOP(total) }}</span>
    </div>

    <ul
      v-if="sortedSales.length"
      class="divide-y divide-gold/10 overflow-hidden rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10"
      :class="{ 'opacity-60': pending }"
    >
      <li v-for="sale in sortedSales" :key="sale.id" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
        <span class="text-gold-soft/60">{{ sale.time }}</span>
        <span class="flex-1">
          <span class="text-gold-soft">{{ sale.qty }} x {{ sale.dishName }}</span>
          <span v-if="sale.vendedorNombre" class="block text-[0.65rem] text-gold-soft/50">{{ sale.vendedorNombre }}</span>
        </span>
        <span class="font-semibold text-gold">{{ formatCOP(sale.totalThousands) }}</span>
        <button
          type="button"
          :disabled="deletingId === sale.id"
          class="text-ember-soft hover:text-ember disabled:opacity-40"
          @click="remove(sale.id)"
        >
          <Icon name="lucide:trash-2" class="size-4" />
        </button>
      </li>
    </ul>
    <p v-else-if="!pending" class="text-sm text-gold-soft/50">No hay ventas registradas este día.</p>
  </section>
</template>
