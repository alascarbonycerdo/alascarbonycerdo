<script setup lang="ts">
const { inventory, addStock, removeStock, updateInventoryConfig } = useDashboard()
const { isAdmin } = useProfile()

const packages = reactive<Record<string, number>>({})
const pkgCount = (id: string) => packages[id] ?? 0
const incPkg = (id: string) => (packages[id] = pkgCount(id) + 1)
const decPkg = (id: string) => (packages[id] = Math.max(0, pkgCount(id) - 1))

const unitsToAdd = (item: { id: string; unitsPerPackage: number }) => pkgCount(item.id) * item.unitsPerPackage

const submitting = ref<string | null>(null)

const submitRestock = async (item: { id: string; unitsPerPackage: number }) => {
  const units = unitsToAdd(item)
  if (!units) return
  submitting.value = item.id
  try {
    await addStock(item.id, units)
    packages[item.id] = 0
  } finally {
    submitting.value = null
  }
}

const removals = reactive<Record<string, number>>({})
const removeQty = (id: string) => removals[id] ?? 0
const incRemove = (item: { id: string; currentStock: number }) =>
  (removals[item.id] = Math.min(item.currentStock, removeQty(item.id) + 1))
const decRemove = (id: string) => (removals[id] = Math.max(0, removeQty(id) - 1))

const removing = ref<string | null>(null)

const submitRemove = async (item: { id: string; name: string }) => {
  const qty = removeQty(item.id)
  if (!qty) return
  if (!confirm(`¿Quitar ${qty} unidades de ${item.name} del inventario?`)) return
  removing.value = item.id
  try {
    await removeStock(item.id, qty)
    removals[item.id] = 0
  } finally {
    removing.value = null
  }
}

const minConsumption = (item: { dishes: { consumptionPerSale: number }[] }) => {
  const min = Math.min(...item.dishes.map((d) => d.consumptionPerSale), Infinity)
  return Number.isFinite(min) ? min : 0
}

const onConsumptionChange = (itemId: string, dishId: string, value: string) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed <= 0) return
  updateInventoryConfig(itemId, { dishId, consumptionPerSale: parsed })
}

const onUnitsPerPackageChange = (id: string, value: string) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 1) return
  updateInventoryConfig(id, { unitsPerPackage: parsed })
}
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-display text-2xl text-gold">Inventario</h2>

    <div class="space-y-2">
      <div
        v-for="item in inventory"
        :key="item.id"
        class="rounded-2xl bg-ink-soft/60 p-4 ring-1 ring-gold/10"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-display text-lg leading-tight text-gold">{{ item.name }}</p>
            <p v-if="item.detail" class="text-xs uppercase tracking-wider text-ember-soft">
              {{ item.detail }}
            </p>
          </div>

          <span
            class="flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide"
            :class="
              item.currentStock < minConsumption(item)
                ? 'bg-ember/15 text-ember-soft'
                : 'bg-emerald-500/10 text-emerald-400'
            "
          >
            <Icon
              :name="item.currentStock < minConsumption(item) ? 'lucide:alert-triangle' : 'lucide:check-circle-2'"
              class="size-3.5"
            />
            {{ item.currentStock < minConsumption(item) ? 'Stock bajo' : 'OK' }}
          </span>
        </div>

        <div class="mt-3 flex items-end justify-between gap-3">
          <div>
            <p class="text-[0.65rem] uppercase tracking-widest text-gold-soft/60">En stock</p>
            <p class="font-display text-xl text-gold">{{ item.currentStock }} unidades</p>
          </div>

          <label class="flex flex-col text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            Unidades / paquete
            <input
              type="number"
              min="1"
              :value="item.unitsPerPackage"
              class="mt-1 w-20 rounded-lg bg-ink px-2 py-1 text-sm text-gold ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              @change="onUnitsPerPackageChange(item.id, ($event.target as HTMLInputElement).value)"
            >
          </label>
        </div>

        <div v-if="item.dishes.length" class="mt-3 space-y-1.5 border-t border-gold/10 pt-3">
          <p class="text-[0.65rem] uppercase tracking-widest text-gold-soft/60">Consumo por plato</p>
          <div v-for="dish in item.dishes" :key="dish.dishId" class="flex items-center justify-between gap-3">
            <span class="text-sm text-gold-soft">{{ dish.dishName }}</span>
            <label class="flex items-center gap-1.5 text-[0.65rem] text-gold-soft/60">
              <input
                type="number"
                min="1"
                :value="dish.consumptionPerSale"
                class="w-16 rounded-lg bg-ink px-2 py-1 text-sm text-gold ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
                @change="onConsumptionChange(item.id, dish.dishId, ($event.target as HTMLInputElement).value)"
              >
              unidades / venta
            </label>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between gap-3 border-t border-gold/10 pt-3">
          <div class="flex items-center gap-2">
            <QuantityStepper :qty="pkgCount(item.id)" @increment="incPkg(item.id)" @decrement="decPkg(item.id)" />
            <span class="text-xs text-gold-soft/60">
              paquete{{ pkgCount(item.id) === 1 ? '' : 's' }}
              <span v-if="pkgCount(item.id)" class="text-gold">= {{ unitsToAdd(item) }} unidades</span>
            </span>
          </div>
          <button
            type="button"
            :disabled="!pkgCount(item.id) || submitting === item.id"
            class="rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-30"
            @click="submitRestock(item)"
          >
            Agregar
          </button>
        </div>

        <div v-if="isAdmin" class="mt-3 flex items-center justify-between gap-3 border-t border-gold/10 pt-3">
          <div class="flex items-center gap-2">
            <QuantityStepper :qty="removeQty(item.id)" @increment="incRemove(item)" @decrement="decRemove(item.id)" />
            <span class="text-xs text-gold-soft/60">
              unidad{{ removeQty(item.id) === 1 ? '' : 'es' }} a quitar
            </span>
          </div>
          <button
            type="button"
            :disabled="!removeQty(item.id) || removing === item.id"
            class="rounded-lg bg-ember/15 px-3 py-1.5 text-sm font-semibold text-ember-soft transition hover:bg-ember/25 disabled:opacity-30"
            @click="submitRemove(item)"
          >
            Quitar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>
