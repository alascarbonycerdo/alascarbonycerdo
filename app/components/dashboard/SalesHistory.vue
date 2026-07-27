<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'
import { porkItems, wingsCombos } from '#shared/utils/menu'
import { formatDia } from '#shared/utils/horario'

const dishes = [...wingsCombos, ...porkItems]

const { date, sales, pending, error, load, removeSale, addBackdatedSale } = useSalesHistory()
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

const showAddModal = ref(false)
const addForm = reactive({ dishId: '', qty: 1 })
const addError = ref('')
const adding = ref(false)

const openAddModal = () => {
  addForm.dishId = ''
  addForm.qty = 1
  addError.value = ''
  showAddModal.value = true
}

const incQty = () => (addForm.qty += 1)
const decQty = () => (addForm.qty = Math.max(1, addForm.qty - 1))

const submitAdd = async () => {
  if (!addForm.dishId || addForm.qty <= 0) return
  addError.value = ''
  adding.value = true
  try {
    await addBackdatedSale(addForm.dishId, addForm.qty, date.value)
    await refreshDashboard()
    showAddModal.value = false
  } catch (e) {
    addError.value = e instanceof Error ? e.message : 'No se pudo agregar la venta'
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-2">
      <h2 class="font-display text-2xl text-gold">Historial de ventas</h2>
      <div class="flex items-center gap-2">
        <label class="flex items-center gap-2 rounded-lg bg-ink-soft/60 px-2.5 py-1.5 ring-1 ring-gold/15">
          <Icon name="lucide:calendar" class="size-4 text-gold-soft/60" />
          <input
            v-model="date"
            type="date"
            class="bg-transparent text-sm text-gold-soft focus:outline-none [color-scheme:dark]"
          >
        </label>
        <button
          type="button"
          class="flex size-9 items-center justify-center rounded-lg bg-gold text-ink transition hover:bg-gold-soft"
          aria-label="Agregar venta"
          @click="openAddModal"
        >
          <Icon name="lucide:plus" class="size-4" />
        </button>
      </div>
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

    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="showAddModal = false"
    >
      <div class="w-full max-w-sm space-y-4 rounded-2xl bg-ink p-5 ring-1 ring-gold/20">
        <div class="flex items-center justify-between">
          <h3 class="font-display text-lg text-gold">Agregar venta</h3>
          <button type="button" class="text-gold-soft/60 transition hover:text-gold" @click="showAddModal = false">
            <Icon name="lucide:x" class="size-5" />
          </button>
        </div>

        <p class="text-xs text-gold-soft/60">Se registrará el {{ formatDia(date) }}.</p>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Plato
          <select
            v-model="addForm.dishId"
            class="rounded-lg bg-ink-soft px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
            <option value="" disabled>Selecciona un plato</option>
            <option v-for="dish in dishes" :key="dish.id" :value="dish.id">{{ dish.name }}</option>
          </select>
        </label>

        <div class="flex items-center justify-between">
          <span class="text-[0.65rem] uppercase tracking-widest text-gold-soft/60">Cantidad</span>
          <QuantityStepper :qty="addForm.qty" @increment="incQty" @decrement="decQty" />
        </div>

        <p v-if="addError" class="text-xs text-ember-soft">{{ addError }}</p>

        <button
          type="button"
          :disabled="!addForm.dishId || adding"
          class="w-full rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
          @click="submitAdd"
        >
          {{ adding ? 'Agregando…' : 'Agregar venta' }}
        </button>
      </div>
    </div>
  </section>
</template>
