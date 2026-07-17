<script setup lang="ts">
import { contact } from '#shared/utils/menu'

const { totalItems, formattedTotal, whatsappUrl } = useOrder()
const { hasAddress } = useDelivery()
</script>

<template>
  <div class="fixed inset-x-0 bottom-0 z-20 border-t border-gold/10 bg-ink/95 backdrop-blur">
    <div class="mx-auto max-w-md px-4 py-3">
      <a
        v-if="totalItems > 0 && hasAddress"
        :href="whatsappUrl"
        target="_blank"
        rel="noopener"
        class="flex items-center justify-between gap-3 rounded-xl bg-ember px-4 py-3 text-ink transition hover:bg-ember-soft"
      >
        <span class="leading-tight">
          <span class="block text-[0.65rem] uppercase tracking-widest opacity-80">
            {{ totalItems }} {{ totalItems === 1 ? 'ítem' : 'ítems' }}
          </span>
          <span class="font-display text-xl text-gold">{{ formattedTotal }}</span>
        </span>
        <span class="flex items-center gap-2 font-display text-sm tracking-wide">
          <Icon name="ic:baseline-whatsapp" class="size-5" />
          Pedir por WhatsApp
        </span>
      </a>
      <a
        v-else-if="totalItems > 0"
        href="#entrega"
        class="flex items-center justify-between gap-3 rounded-xl bg-ink-soft px-4 py-3 text-gold ring-1 ring-gold/30 transition hover:bg-ink-soft/70"
      >
        <span class="leading-tight">
          <span class="block text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            {{ totalItems }} {{ totalItems === 1 ? 'ítem' : 'ítems' }}
          </span>
          <span class="font-display text-xl">{{ formattedTotal }}</span>
        </span>
        <span class="flex items-center gap-2 font-display text-sm tracking-wide text-ember-soft">
          <Icon name="lucide:map-pin" class="size-5" />
          Agrega tu dirección
        </span>
      </a>
      <a
        v-else
        :href="whatsappUrl"
        target="_blank"
        rel="noopener"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-ember py-3 font-display text-lg tracking-wide text-ink transition hover:bg-ember-soft"
      >
        <Icon name="ic:baseline-whatsapp" class="size-5" />
        {{ contact.whatsappDisplay }}
      </a>
    </div>
  </div>
</template>
