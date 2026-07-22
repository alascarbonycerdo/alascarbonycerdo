<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'

definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { refresh, pending, error, todayRevenueThousands, todayItemsSold, lowStockCount } = useDashboard()

await useAsyncData('dashboard-init', () => refresh())
</script>

<template>
  <div>
    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">
      {{ error }}
    </p>

    <div class="grid grid-cols-3 gap-3">
      <StatTile label="Ventas de hoy" :value="formatCOP(todayRevenueThousands)" />
      <StatTile label="Ítems vendidos" :value="String(todayItemsSold)" />
      <StatTile label="Stock bajo" :value="String(lowStockCount)" :tone="lowStockCount > 0 ? 'ember' : 'gold'" />
    </div>

    <div class="mt-10 space-y-12" :class="{ 'opacity-60': pending }">
      <SalesPanel />
      <InventoryPanel />
      <WeeklyChart />
    </div>
  </div>
</template>
