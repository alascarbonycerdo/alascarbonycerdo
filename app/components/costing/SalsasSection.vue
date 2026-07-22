<script setup lang="ts">
import type { SalsaConfig } from '#shared/types/costing'
import { salsaCoste, salsaValorEnvasada, sumaValorPorcion } from '#shared/utils/costingCalc'
import { formatCurrency } from '#shared/utils/format'

const props = defineProps<{ salsas: SalsaConfig }>()

const newId = () => (import.meta.client ? crypto.randomUUID() : Math.random().toString(36).slice(2))

const addBatch = () => {
  props.salsas.batches.push({
    id: newId(),
    nombre: 'Nueva salsa',
    cantidadRendimiento: 0,
    porcionGramos: 0,
    costeManual: 0,
    ingredientes: [],
  })
}

const removeBatch = (id: string) => {
  const index = props.salsas.batches.findIndex((b) => b.id === id)
  if (index !== -1) props.salsas.batches.splice(index, 1)
}

const addIngrediente = (batchId: string) => {
  const batch = props.salsas.batches.find((b) => b.id === batchId)
  batch?.ingredientes.push({ id: newId(), nombre: 'Nuevo ingrediente', cantidad: 0, valorTienda: 0, porcion: 0 })
}

const removeIngrediente = (batchId: string, insumoId: string) => {
  const batch = props.salsas.batches.find((b) => b.id === batchId)
  if (!batch) return
  const index = batch.ingredientes.findIndex((i) => i.id === insumoId)
  if (index !== -1) batch.ingredientes.splice(index, 1)
}

const sugerenciaSalsera = computed(() => props.salsas.batches.reduce((sum, b) => sum + salsaValorEnvasada(b), 0))
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-gold">Salsas</h2>
      <button type="button" class="text-xs font-semibold text-ember-soft hover:text-ember" @click="addBatch">
        + Nueva salsa
      </button>
    </div>

    <div v-for="batch in salsas.batches" :key="batch.id" class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <div class="flex items-center justify-between gap-2">
        <input
          v-model="batch.nombre"
          type="text"
          class="w-40 rounded-lg bg-ink px-2 py-1 font-display text-base text-gold ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
        <button type="button" class="text-ember-soft hover:text-ember" @click="removeBatch(batch.id)">
          <Icon name="lucide:trash-2" class="size-4" />
        </button>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Rendimiento (g)
          <input
            v-model.number="batch.cantidadRendimiento"
            type="number"
            class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>
        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Porción (g)
          <input
            v-model.number="batch.porcionGramos"
            type="number"
            class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>
        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Coste del lote
          <input
            v-model.number="batch.costeManual"
            type="number"
            :disabled="batch.ingredientes.length > 0"
            class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 disabled:opacity-40"
          >
        </label>
      </div>

      <p class="text-[0.7rem] text-gold-soft/70">
        Coste calculado del lote: <span class="font-semibold text-gold">{{ formatCurrency(salsaCoste(batch)) }}</span>
        · Valor envasado por porción: <span class="font-semibold text-gold">{{ formatCurrency(salsaValorEnvasada(batch)) }}</span>
      </p>

      <InsumoTable
        v-if="batch.ingredientes.length"
        title="Ingredientes de la receta"
        cantidad-label="Cantidad (g)"
        porcion-label="Uso en receta (g)"
        :insumos="batch.ingredientes"
        @add="addIngrediente(batch.id)"
        @remove="(id) => removeIngrediente(batch.id, id)"
      />
      <button
        v-else
        type="button"
        class="text-xs text-gold-soft/60 underline-offset-2 hover:text-gold hover:underline"
        @click="addIngrediente(batch.id)"
      >
        + Desglosar en ingredientes (en vez de costo directo)
      </button>
    </div>

    <div class="space-y-2 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Costo de una salsera llena (valor manual — así estaba en tu hoja)
        <input
          v-model.number="salsas.salseraLlena"
          type="number"
          class="w-40 rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>
      <p class="text-[0.65rem] text-gold-soft/50">
        Suma de los valores envasados por porción de todas las salsas: {{ formatCurrency(sugerenciaSalsera) }}
      </p>
    </div>
  </section>
</template>
