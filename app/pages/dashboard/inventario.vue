<script setup lang="ts">
definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { refresh, pending, error } = useDashboard()

await useAsyncData('inventario-init', () => refresh())
</script>

<template>
  <div>
    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">
      {{ error }}
    </p>

    <div :class="{ 'opacity-60': pending }">
      <InventoryPanel />
    </div>
  </div>
</template>
