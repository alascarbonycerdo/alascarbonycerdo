<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format'

const { state, desgloses, addProducto, removeProducto } = useCosting()
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-gold">Costo por producto</h2>
      <button type="button" class="text-xs font-semibold text-ember-soft hover:text-ember" @click="addProducto">
        + Nuevo producto
      </button>
    </div>

    <div class="overflow-x-auto rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <table class="w-full min-w-[1400px] text-left text-xs">
        <thead>
          <tr class="text-gold-soft/60">
            <th class="px-2 py-1.5 font-medium">Producto</th>
            <th class="px-2 py-1.5 font-medium">Proteína</th>
            <th class="px-2 py-1.5 font-medium">Qty Prot.</th>
            <th class="px-2 py-1.5 font-medium">Qty Acomp.</th>
            <th class="px-2 py-1.5 font-medium">Qty Salsas</th>
            <th class="px-2 py-1.5 font-medium">Qty Empaque</th>
            <th class="px-2 py-1.5 font-medium">Val. Empaque unit.</th>
            <th class="px-2 py-1.5 font-medium">Qty Consum.</th>
            <th class="px-2 py-1.5 font-medium">Carbón</th>
            <th class="px-2 py-1.5 font-medium">Val. Proteína</th>
            <th class="px-2 py-1.5 font-medium">Val. Salsas</th>
            <th class="px-2 py-1.5 font-medium">Val. Acomp.</th>
            <th class="px-2 py-1.5 font-medium">Val. Empaque</th>
            <th class="px-2 py-1.5 font-medium">Val. Consum.</th>
            <th class="px-2 py-1.5 font-medium">Val. Marinada</th>
            <th class="px-2 py-1.5 font-medium">Val. Carbón</th>
            <th class="px-2 py-1.5 font-medium">Costo producto</th>
            <th class="px-2 py-1.5 font-medium">Costo x unidad</th>
            <th class="w-8" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gold/10">
          <tr v-for="producto in state.productos" :key="producto.id">
            <td class="px-2 py-1.5">
              <input
                v-model="producto.nombre"
                type="text"
                class="w-28 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <select
                v-model="producto.proteinaId"
                class="rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
                <option v-for="proteina in state.proteinas" :key="proteina.id" :value="proteina.id">
                  {{ proteina.nombre }}
                </option>
              </select>
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="producto.qtyProteina"
                type="number"
                class="w-16 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="producto.qtyAcompanantes"
                type="number"
                class="w-16 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="producto.qtySalsas"
                type="number"
                class="w-16 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="producto.qtyEmpaque"
                type="number"
                class="w-16 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="producto.valorEmpaqueUnitario"
                type="number"
                class="w-24 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <input
                v-model.number="producto.qtyConsumibles"
                type="number"
                class="w-16 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </td>
            <td class="px-2 py-1.5">
              <select
                v-model="producto.carbonId"
                class="rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
                <option v-for="item in state.carbon.items" :key="item.id" :value="item.id">
                  {{ item.tipo }}
                </option>
              </select>
            </td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(desgloses[producto.id]?.valProteina ?? 0) }}</td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(desgloses[producto.id]?.valSalsas ?? 0) }}</td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(desgloses[producto.id]?.valAcompanantes ?? 0) }}</td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(desgloses[producto.id]?.valEmpaque ?? 0) }}</td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(desgloses[producto.id]?.valConsumibles ?? 0) }}</td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(desgloses[producto.id]?.valMarinada ?? 0) }}</td>
            <td class="px-2 py-1.5 tabular-nums text-gold-soft">{{ formatCurrency(desgloses[producto.id]?.valCarbon ?? 0) }}</td>
            <td class="px-2 py-1.5 font-semibold tabular-nums text-gold">
              {{ formatCurrency(desgloses[producto.id]?.costoProducto ?? 0) }}
            </td>
            <td class="px-2 py-1.5 font-semibold tabular-nums text-ember-soft">
              {{ formatCurrency(desgloses[producto.id]?.costoPorUnidad ?? 0) }}
            </td>
            <td class="px-2 py-1.5">
              <button type="button" class="text-ember-soft hover:text-ember" @click="removeProducto(producto.id)">
                <Icon name="lucide:trash-2" class="size-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
