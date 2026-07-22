<script setup lang="ts">
import type { EmpaqueItem } from '#shared/types/costing'
import { empaqueValorUnd } from '#shared/utils/costingCalc'
import { formatCurrency } from '#shared/utils/format'

defineProps<{ items: EmpaqueItem[] }>()

const emit = defineEmits<{ add: []; remove: [id: string] }>()
</script>

<template>
  <div class="space-y-2 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
    <div class="flex items-center justify-between">
      <h3 class="font-display text-lg text-gold">Empaques y consumibles</h3>
      <button type="button" class="text-xs font-semibold text-ember-soft hover:text-ember" @click="emit('add')">
        + Agregar
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[440px] text-left text-xs">
        <thead>
          <tr class="text-gold-soft/60">
            <th class="px-2 py-1.5 font-medium">Producto</th>
            <th class="px-2 py-1.5 font-medium">Cantidad</th>
            <th class="px-2 py-1.5 font-medium">Valor tienda</th>
            <th class="px-2 py-1.5 font-medium">Valor und.</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gold/10">
          <tr v-for="item in items" :key="item.id">
            <td class="px-2 py-1.5">
              <input
                v-model="item.nombre"
                type="text"
                class="w-32 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="item.cantidad"
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
            <td class="px-2 py-1.5 font-semibold tabular-nums text-gold">
              {{ formatCurrency(empaqueValorUnd(item)) }}
            </td>
            <td class="px-2 py-1.5">
              <button type="button" class="text-ember-soft hover:text-ember" @click="emit('remove', item.id)">
                <Icon name="lucide:trash-2" class="size-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
