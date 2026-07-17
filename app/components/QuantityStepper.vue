<script setup lang="ts">
defineProps<{ qty: number }>()
const emit = defineEmits<{ increment: []; decrement: [] }>()
</script>

<template>
  <div class="flex items-center gap-3 rounded-full bg-ink ring-1 ring-gold/20">
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-full text-gold transition hover:bg-gold/10 disabled:opacity-30"
      :disabled="qty === 0"
      aria-label="Quitar"
      @click="emit('decrement')"
    >
      <Icon name="lucide:minus" class="size-4" />
    </button>
    <span class="w-4 text-center font-display text-xl text-gold">{{ qty }}</span>
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-full text-gold transition hover:bg-gold/10"
      aria-label="Agregar"
      @click="emit('increment')"
    >
      <Icon name="lucide:plus" class="size-4" />
    </button>
  </div>
</template>
