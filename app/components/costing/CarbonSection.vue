<script setup lang="ts">
import type { CarbonConfig } from '#shared/types/costing'
import { carbonValorPorKilo, carbonValorPorPlato } from '#shared/utils/costingCalc'
import { formatCurrency } from '#shared/utils/format'

const props = defineProps<{ carbon: CarbonConfig }>()

const newId = () => (import.meta.client ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const addItem = () => {
  props.carbon.items.push({ id: newId(), tipo: 'Nuevo carbón', pesoKilo: 0, valorTienda: 0 })
}

const removeItem = (id: string) => {
  const index = props.carbon.items.findIndex((item) => item.id === id)
  if (index !== -1) props.carbon.items.splice(index, 1)
}
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-gold">Energía carbonística</h2>
      <button type="button" class="text-xs font-semibold text-ember-soft hover:text-ember" @click="addItem">
        + Agregar
      </button>
    </div>

    <label class="flex w-40 flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
      Platos por kilo de carbón
      <input
        v-model.number="carbon.platosPorKilo"
        type="number"
        class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
      >
    </label>

    <div class="overflow-x-auto rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <table class="w-full min-w-[560px] text-left text-xs">
        <thead>
          <tr class="text-gold-soft/60">
            <th class="px-2 py-1.5 font-medium">Tipo</th>
            <th class="px-2 py-1.5 font-medium">Peso (kg)</th>
            <th class="px-2 py-1.5 font-medium">Valor tienda</th>
            <th class="px-2 py-1.5 font-medium">Valor x kg</th>
            <th class="px-2 py-1.5 font-medium">Valor x plato</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gold/10">
          <tr v-for="item in carbon.items" :key="item.id">
            <td class="px-2 py-1.5">
              <input
                v-model="item.tipo"
                type="text"
                class="w-36 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="item.pesoKilo"
                type="number"
                class="w-20 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="item.valorTienda"
                type="number"
                class="w-24 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(carbonValorPorKilo(item)) }}</td>
            <td class="px-2 py-1.5 font-semibold tabular-nums text-gold">
              {{ formatCurrency(carbonValorPorPlato(item, carbon.platosPorKilo)) }}
            </td>
            <td class="px-2 py-1.5">
              <button type="button" class="text-ember-soft hover:text-ember" @click="removeItem(item.id)">
                <Icon name="lucide:trash-2" class="size-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
