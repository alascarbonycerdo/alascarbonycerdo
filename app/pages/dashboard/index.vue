<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'

const { refresh, pending, error, todayRevenueThousands, todayItemsSold, lowStockCount } = useDashboard()

await useAsyncData('dashboard-init', () => refresh())
</script>

<template>
  <div class="min-h-screen bg-ink pb-16">
    <div class="mx-auto max-w-2xl px-5 pt-8">
      <header class="flex items-center justify-between">
        <div>
          <p class="font-display text-2xl text-gold">Dashboard</p>
          <p class="text-xs uppercase tracking-widest text-ember-soft">Alas Carbón &amp; Cerdo</p>
        </div>
        <div class="flex items-center gap-4 text-xs font-medium text-gold-soft/70">
          <NuxtLink to="/dashboard/costos" class="underline-offset-4 hover:text-gold hover:underline">
            Costeo
          </NuxtLink>
          <NuxtLink to="/" class="underline-offset-4 hover:text-gold hover:underline">
            Ver menú
          </NuxtLink>
        </div>
      </header>

      <p v-if="error" class="mt-6 rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">
        {{ error }}
      </p>

      <div class="mt-6 grid grid-cols-3 gap-3">
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
  </div>
</template>
