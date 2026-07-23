<script setup lang="ts">
definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { isAdmin } = useProfile()
</script>

<template>
  <div class="space-y-4">
    <h2 class="font-display text-2xl text-gold">Recursos de marca</h2>

    <NuxtLink
      to="/dashboard/manual"
      class="flex items-center gap-4 rounded-2xl bg-ink-soft/40 p-5 ring-1 ring-gold/10 transition hover:bg-ink-soft/70"
    >
      <Icon name="lucide:book-open" class="size-8 shrink-0 text-ember" />
      <div>
        <p class="font-display text-lg text-gold">Manual de la marca</p>
        <p class="text-xs text-gold-soft/60">Identidad, tono y lineamientos de Alas Carbón &amp; Cerdo</p>
      </div>
    </NuxtLink>

    <NuxtLink
      to="/dashboard/emplatado"
      class="flex items-center gap-4 rounded-2xl bg-ink-soft/40 p-5 ring-1 ring-gold/10 transition hover:bg-ink-soft/70"
    >
      <Icon name="lucide:utensils-crossed" class="size-8 shrink-0 text-ember" />
      <div>
        <p class="font-display text-lg text-gold">Guía de emplatado</p>
        <p class="text-xs text-gold-soft/60">Paso a paso por plato para que siempre se vea igual</p>
      </div>
    </NuxtLink>

    <NuxtLink
      v-if="isAdmin"
      to="/dashboard/costos"
      class="flex items-center gap-4 rounded-2xl bg-ink-soft/40 p-5 ring-1 ring-gold/10 transition hover:bg-ink-soft/70"
    >
      <Icon name="lucide:calculator" class="size-8 shrink-0 text-ember" />
      <div>
        <p class="font-display text-lg text-gold">Costeo</p>
        <p class="text-xs text-gold-soft/60">Cálculo de costos e insumos por plato</p>
      </div>
    </NuxtLink>
  </div>
</template>
