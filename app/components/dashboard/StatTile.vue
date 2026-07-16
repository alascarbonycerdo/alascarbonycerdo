<script setup lang="ts">
defineProps<{ label: string; value: string; tone?: 'gold' | 'ember' }>()
</script>

<template>
  <div class="rounded-2xl bg-ink-soft/60 px-4 py-3 ring-1 ring-gold/10">
    <p class="text-xs text-gold-soft/70">{{ label }}</p>
    <p class="mt-1 text-2xl font-semibold" :class="tone === 'ember' ? 'text-ember-soft' : 'text-gold'">
      {{ value }}
    </p>
  </div>
</template>
