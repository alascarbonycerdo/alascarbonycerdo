<script setup lang="ts">
const props = defineProps<{ nombre?: string | null; avatarUrl?: string | null }>()

const initials = computed(() => {
  const source = props.nombre?.trim()
  if (!source) return '?'
  const parts = source.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
})
</script>

<template>
  <div class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold ring-1 ring-gold/30">
    <img v-if="avatarUrl" :src="avatarUrl" alt="" class="size-full object-cover">
    <span v-else class="text-sm font-semibold text-ink">{{ initials }}</span>
  </div>
</template>
