<script setup lang="ts">
import type { LaborConfig } from '#shared/types/costing'
import { formatCurrency } from '#shared/utils/format'

const props = defineProps<{ labor: LaborConfig }>()

const valorXHora = computed(() => (props.labor.horas ? props.labor.valorDia / props.labor.horas : 0))
</script>

<template>
  <section class="space-y-3">
    <h2 class="font-display text-2xl text-gold">Costo laboral</h2>
    <p class="text-xs text-gold-soft/60">Referencia informativa — no se suma al costo del producto.</p>

    <div class="grid grid-cols-2 gap-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10 sm:grid-cols-3">
      <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Personal
        <input
          v-model="labor.personal"
          type="text"
          class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>
      <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Valor día
        <input
          v-model.number="labor.valorDia"
          type="number"
          class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>
      <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Horas
        <input
          v-model.number="labor.horas"
          type="number"
          class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>
      <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Platos x jornada
        <input
          v-model.number="labor.platosXJornada"
          type="number"
          class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>
      <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Valor x plato (manual)
        <input
          v-model.number="labor.valorPorPlatoManual"
          type="number"
          class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>
      <p class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Valor x hora (calculado)
        <span class="rounded-lg bg-ink px-2 py-1 text-sm font-semibold text-gold ring-1 ring-gold/10">
          {{ formatCurrency(valorXHora) }}
        </span>
      </p>
    </div>
  </section>
</template>
