<script setup lang="ts">
import { porkItems } from '#shared/utils/menu'

const { qty, increment, decrement } = useOrder()
</script>

<template>
  <section class="space-y-4">
    <div class="flex items-center gap-3">
      <span class="h-px flex-1 bg-ember/50" />
      <h2 class="font-display text-3xl text-gold">Cerdo</h2>
      <span class="h-px flex-1 bg-ember/50" />
    </div>

    <div class="grid gap-3">
      <div
        v-for="item in porkItems"
        :key="item.id"
        class="flex items-center justify-between rounded-2xl bg-ink-soft/60 px-4 py-3 ring-1 transition"
        :class="qty(item.id) > 0 ? 'ring-ember/60 bg-ink-soft' : 'ring-gold/10'"
      >
        <div>
          <p class="font-display text-lg leading-tight text-gold">{{ item.name }}</p>
          <p v-if="item.detail" class="text-xs font-semibold uppercase tracking-wider text-ember-soft">
            {{ item.detail }}
          </p>
        </div>
        <div class="flex items-center gap-4">
          <span class="font-display text-xl text-gold">
            {{ item.priceThousands }}
            <span class="align-top text-xs">MIL</span>
          </span>
          <QuantityStepper :qty="qty(item.id)" @increment="increment(item.id)" @decrement="decrement(item.id)" />
        </div>
      </div>
    </div>
  </section>
</template>
