<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'
import { porkItems, wingsCombos } from '#shared/utils/menu'
import { formatDia } from '#shared/utils/horario'

const dishes = [...wingsCombos, ...porkItems]

const { date, pedidos, pending, error, load, removePedido, addBackdatedPedido, totalMiles } = usePedidos()
const { refresh: refreshDashboard } = useDashboard()

await useAsyncData('pedidos-history-init', () => load())

watch(date, () => load())

const deletingId = ref<string | null>(null)
const deleteError = ref('')

const remove = async (id: string) => {
  if (!confirm('¿Eliminar este pedido? El stock descontado se va a devolver al inventario.')) return
  deleteError.value = ''
  deletingId.value = id
  try {
    await removePedido(id)
    await refreshDashboard()
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'No se pudo eliminar el pedido'
  } finally {
    deletingId.value = null
  }
}

const sortedPedidos = computed(() => [...pedidos.value].sort((a, b) => b.time.localeCompare(a.time)))

const showAddModal = ref(false)
const addQuantities = reactive<Record<string, number>>({})
const addError = ref('')
const adding = ref(false)

const addQty = (id: string) => addQuantities[id] ?? 0
const addIncrement = (id: string) => (addQuantities[id] = addQty(id) + 1)
const addDecrement = (id: string) => (addQuantities[id] = Math.max(0, addQty(id) - 1))

const addCart = computed(() =>
  dishes
    .filter((dish) => addQty(dish.id) > 0)
    .map((dish) => ({ dish, cantidad: addQty(dish.id), subtotal: dish.priceThousands * addQty(dish.id) })),
)
const addTotal = computed(() => addCart.value.reduce((sum, entry) => sum + entry.subtotal, 0))

const openAddModal = () => {
  dishes.forEach((dish) => (addQuantities[dish.id] = 0))
  addError.value = ''
  showAddModal.value = true
}

const submitAdd = async () => {
  if (!addCart.value.length) return
  addError.value = ''
  adding.value = true
  try {
    await addBackdatedPedido(
      addCart.value.map((entry) => ({ dishId: entry.dish.id, cantidad: entry.cantidad })),
      date.value,
    )
    await refreshDashboard()
    showAddModal.value = false
  } catch (e) {
    addError.value = e instanceof Error ? e.message : 'No se pudo agregar el pedido'
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between gap-2">
      <h2 class="font-display text-2xl text-gold">Historial de pedidos</h2>
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
          aria-label="Agregar pedido"
          @click="openAddModal"
        >
          <Icon name="lucide:plus" class="size-4" />
        </button>
      </div>
    </div>

    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>
    <p v-if="deleteError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ deleteError }}</p>

    <div class="flex items-center justify-between text-xs text-gold-soft/60">
      <span>{{ pedidos.length }} {{ pedidos.length === 1 ? 'pedido' : 'pedidos' }}</span>
      <span class="font-semibold text-gold">{{ formatCOP(totalMiles) }}</span>
    </div>

    <ul v-if="sortedPedidos.length" class="space-y-2" :class="{ 'opacity-60': pending }">
      <li
        v-for="pedido in sortedPedidos"
        :key="pedido.id"
        class="space-y-2 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="text-sm font-semibold text-gold">{{ pedido.time }}</p>
            <p class="text-xs text-gold-soft/60">
              {{ pedido.responsableNombre ?? 'Sin responsable' }}
              <span v-if="pedido.puntoVentaNombre"> · {{ pedido.puntoVentaNombre }}</span>
            </p>
          </div>
          <div class="flex items-center gap-3">
            <span class="font-semibold text-gold">{{ formatCOP(pedido.totalMiles) }}</span>
            <button
              type="button"
              :disabled="deletingId === pedido.id"
              class="relative text-ember-soft transition hover:text-ember disabled:opacity-40"
              aria-label="Eliminar pedido"
              @click="remove(pedido.id)"
            >
              <Icon name="lucide:trash-2" class="size-4" :class="{ invisible: deletingId === pedido.id }" />
              <span v-if="deletingId === pedido.id" class="absolute inset-0 flex items-center justify-center">
                <span class="size-3 animate-spin rounded-full border-2 border-ember/30 border-t-ember" />
              </span>
            </button>
          </div>
        </div>

        <ul class="space-y-1 text-xs text-gold-soft/70">
          <li v-for="item in pedido.items" :key="item.dishId" class="flex items-center justify-between">
            <span>{{ item.cantidad }} x {{ item.dishNombre }}</span>
            <span>{{ formatCOP(item.subtotalMiles) }}</span>
          </li>
        </ul>
      </li>
    </ul>
    <p v-else-if="!pending" class="text-sm text-gold-soft/50">No hay pedidos registrados este día.</p>

    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      @click.self="showAddModal = false"
    >
      <div class="max-h-[85vh] w-full max-w-sm space-y-4 overflow-y-auto rounded-2xl bg-ink p-5 ring-1 ring-gold/20">
        <div class="flex items-center justify-between">
          <h3 class="font-display text-lg text-gold">Agregar pedido</h3>
          <button type="button" class="text-gold-soft/60 transition hover:text-gold" @click="showAddModal = false">
            <Icon name="lucide:x" class="size-5" />
          </button>
        </div>

        <p class="text-xs text-gold-soft/60">Se registrará el {{ formatDia(date) }}.</p>

        <div class="space-y-2">
          <div
            v-for="dish in dishes"
            :key="dish.id"
            class="flex items-center justify-between gap-3 rounded-xl bg-ink-soft/60 px-3 py-2"
          >
            <div>
              <p class="text-sm text-gold">{{ dish.name }}</p>
              <p class="text-[0.65rem] text-gold-soft/60">{{ dish.priceThousands }} MIL</p>
            </div>
            <QuantityStepper
              :qty="addQty(dish.id)"
              @increment="addIncrement(dish.id)"
              @decrement="addDecrement(dish.id)"
            />
          </div>
        </div>

        <div v-if="addCart.length" class="flex items-center justify-between border-t border-gold/10 pt-3 text-sm font-semibold">
          <span class="text-gold-soft">Total</span>
          <span class="text-gold">{{ formatCOP(addTotal) }}</span>
        </div>

        <p v-if="addError" class="text-xs text-ember-soft">{{ addError }}</p>

        <button
          type="button"
          :disabled="!addCart.length || adding"
          class="relative w-full rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
          @click="submitAdd"
        >
          <span :class="{ invisible: adding }">Agregar pedido</span>
          <span v-if="adding" class="absolute inset-0 flex items-center justify-center">
            <span class="size-4 animate-spin rounded-full border-2 border-ink/30 border-t-ink" />
          </span>
        </button>
      </div>
    </div>
  </section>
</template>
