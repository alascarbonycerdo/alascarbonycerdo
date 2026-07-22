<script setup lang="ts">
import type { RecipeInsumo } from '#shared/types/costing'
import { valorPorcion } from '#shared/utils/costingCalc'
import { formatCurrency } from '#shared/utils/format'

defineProps<{
  title: string
  insumos: RecipeInsumo[]
  cantidadLabel?: string
  porcionLabel?: string
}>()

const emit = defineEmits<{ add: []; remove: [id: string] }>()
</script>

<template>
  <div class="space-y-2 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
    <div class="flex items-center justify-between">
      <h3 class="font-display text-lg text-gold">{{ title }}</h3>
      <button type="button" class="text-xs font-semibold text-ember-soft hover:text-ember" @click="emit('add')">
        + Agregar
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[560px] text-left text-xs">
        <thead>
          <tr class="text-gold-soft/60">
            <th class="px-2 py-1.5 font-medium">Nombre</th>
            <th class="px-2 py-1.5 font-medium">{{ cantidadLabel ?? 'Cantidad' }}</th>
            <th class="px-2 py-1.5 font-medium">Valor tienda</th>
            <th class="px-2 py-1.5 font-medium">{{ porcionLabel ?? 'Porción' }}</th>
            <th class="px-2 py-1.5 font-medium">Valor x porción</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gold/10">
          <tr v-for="insumo in insumos" :key="insumo.id">
            <td class="px-2 py-1.5">
              <input
                v-model="insumo.nombre"
                type="text"
                class="w-32 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="insumo.cantidad"
                type="number"
                class="w-20 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="insumo.valorTienda"
                type="number"
                class="w-24 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="insumo.porcion"
                type="number"
                class="w-20 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5 font-semibold tabular-nums text-gold">
              {{ formatCurrency(valorPorcion(insumo)) }}
            </td>
            <td class="px-2 py-1.5">
              <button type="button" class="text-ember-soft hover:text-ember" @click="emit('remove', insumo.id)">
                <Icon name="lucide:trash-2" class="size-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
