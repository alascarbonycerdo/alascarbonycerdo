<script setup lang="ts">
import type { MarinadaConfig, RecipeInsumo } from '#shared/types/costing'
import { sumaValorPorcion } from '#shared/utils/costingCalc'
import { formatCurrency } from '#shared/utils/format'

const props = defineProps<{ marinada: MarinadaConfig; proteinas: { id: string; nombre: string }[] }>()

const newId = () => (import.meta.client ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const addIngrediente = () => {
  props.marinada.ingredientes.push({ id: newId(), nombre: 'Nuevo ingrediente', cantidad: 0, valorTienda: 0, porcion: 0 })
}

const removeIngrediente = (id: string) => {
  const index = props.marinada.ingredientes.findIndex((i: RecipeInsumo) => i.id === id)
  if (index !== -1) props.marinada.ingredientes.splice(index, 1)
}

const totalLote = computed(() => sumaValorPorcion(props.marinada.ingredientes))
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-display text-2xl text-gold">Marinada</h2>

    <label class="flex w-40 flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
      Rinde (gramos)
      <input
        v-model.number="marinada.rendimientoGramos"
        type="number"
        class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
      >
    </label>

    <InsumoTable
      title="Ingredientes"
      cantidad-label="Cantidad (g)"
      porcion-label="Uso en receta (g)"
      :insumos="marinada.ingredientes"
      @add="addIngrediente"
      @remove="removeIngrediente"
    />
    <p class="text-[0.7rem] text-gold-soft/70">
      Coste total del lote: <span class="font-semibold text-gold">{{ formatCurrency(totalLote) }}</span>
    </p>

    <div class="space-y-2 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <p class="text-xs uppercase tracking-widest text-gold-soft/70">
        Costo de marinada por proteína (valor manual — así estaba en tu hoja)
      </p>
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label
          v-for="proteina in proteinas"
          :key="proteina.id"
          class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60"
        >
          {{ proteina.nombre }}
          <input
            :value="marinada.costoPorProteina[proteina.id] ?? 0"
            type="number"
            class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
            @input="marinada.costoPorProteina[proteina.id] = Number(($event.target as HTMLInputElement).value)"
          >
        </label>
      </div>
    </div>
  </section>
</template>
