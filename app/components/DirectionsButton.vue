<script setup lang="ts">
const directionsUrl =
  'https://www.google.com/maps/place/Parador+Caballo+Loco/@6.27278,-75.594771,19z/data=!4m6!3m5!1s0x8e4429a4ac3f5791:0x6511c60f84152613!8m2!3d6.2732141!4d-75.5948857!16s%2Fg%2F11v5x52bds?entry=ttu&g_ep=EgoyMDI2MDcxNC4wIKXMDSoASAFQAw%3D%3D'
</script>

<template>
  <a
    :href="directionsUrl"
    target="_blank"
    rel="noopener"
    class="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-ink-soft/60 px-4 py-4 ring-1 ring-gold/15 transition hover:bg-ink-soft"
  >
    <Icon name="lucide:map-pin" class="size-6 text-ember" />
    <span class="font-display text-sm tracking-wide text-gold">Cómo llegar</span>
  </a>
</template>
