<script setup lang="ts">
import { wingsCombos } from '#shared/utils/menu'

const { qty, increment, decrement } = useOrder()
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="h-px flex-1 bg-ember/50" />
      <h2 class="font-display text-3xl text-gold">Alas</h2>
      <span class="h-px flex-1 bg-ember/50" />
    </div>

    <div class="grid gap-3">
      <div
        v-for="combo in wingsCombos"
        :key="combo.id"
        class="flex items-center justify-between rounded-2xl bg-ink-soft/60 px-4 py-3 ring-1 transition"
        :class="qty(combo.id) > 0 ? 'ring-ember/60 bg-ink-soft' : 'ring-gold/10'"
      >
        <div class="flex items-baseline gap-2 font-display text-gold">
          <span class="text-2xl">{{ combo.name.split(' ')[0] }}</span>
          <span class="text-ember">X</span>
          <span class="text-2xl">
            {{ combo.priceThousands }}
            <span class="align-top text-sm">MIL</span>
          </span>
        </div>
        <QuantityStepper :qty="qty(combo.id)" @increment="increment(combo.id)" @decrement="decrement(combo.id)" />
      </div>
    </div>
  </section>
</template>
