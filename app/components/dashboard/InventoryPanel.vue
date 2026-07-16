<script setup lang="ts">
const { inventory, addStock, setConsumption } = useDashboard()

const restockAmounts = reactive<Record<string, number>>({})

const restockAmount = (id: string) => restockAmounts[id] ?? 500

const submitRestock = async (id: string) => {
  const amount = restockAmount(id)
  if (!amount || amount <= 0) return
  await addStock(id, amount)
  restockAmounts[id] = 0
}

const onConsumptionChange = (id: string, value: string) => {
  const parsed = Number(value)
  if (Number.isNaN(parsed) || parsed < 0) return
  setConsumption(id, parsed)
}

const formatGrams = (grams: number) =>
  grams >= 1000 ? `${(grams / 1000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} kg` : `${grams} g`
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-display text-2xl text-gold">Inventario crudo</h2>

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
              item.currentStock < item.consumptionPerSale
                ? 'bg-ember/15 text-ember-soft'
                : 'bg-emerald-500/10 text-emerald-400'
            "
          >
            <Icon
              :name="item.currentStock < item.consumptionPerSale ? 'lucide:alert-triangle' : 'lucide:check-circle-2'"
              class="size-3.5"
            />
            {{ item.currentStock < item.consumptionPerSale ? 'Stock bajo' : 'OK' }}
          </span>
        </div>

        <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="text-[0.65rem] uppercase tracking-widest text-gold-soft/60">En stock</p>
            <p class="font-display text-xl text-gold">{{ formatGrams(item.currentStock) }}</p>
          </div>

          <label class="flex flex-col text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            Consumo / venta (g)
            <input
              type="number"
              min="0"
              :value="item.consumptionPerSale"
              class="mt-1 w-24 rounded-lg bg-ink px-2 py-1 text-sm text-gold ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              @change="onConsumptionChange(item.id, ($event.target as HTMLInputElement).value)"
            >
          </label>

          <div class="flex items-end gap-2">
            <label class="flex flex-col text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Agregar stock (g)
              <input
                type="number"
                min="0"
                step="50"
                :value="restockAmount(item.id)"
                class="mt-1 w-24 rounded-lg bg-ink px-2 py-1 text-sm text-gold ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
                @input="restockAmounts[item.id] = Number(($event.target as HTMLInputElement).value)"
              >
            </label>
            <button
              type="button"
              class="rounded-lg bg-gold px-3 py-1.5 text-sm font-semibold text-ink transition hover:bg-gold-soft"
              @click="submitRestock(item.id)"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
