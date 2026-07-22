<script setup lang="ts">
defineProps<{ isAdmin: boolean }>()

const route = useRoute()
const isActive = (path: string) => route.path === path
</script>

<template>
  <nav class="fixed inset-x-0 bottom-0 z-20 border-t border-gold/10 bg-ink/95 backdrop-blur">
    <div class="mx-auto flex max-w-2xl items-stretch justify-around px-2 py-2">
      <NuxtLink
        to="/dashboard"
        class="flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition"
        :class="isActive('/dashboard') ? 'text-gold' : 'text-gold-soft/60 hover:text-gold-soft'"
      >
        <Icon name="lucide:shopping-cart" class="size-5" />
        Ventas
      </NuxtLink>

      <NuxtLink
        v-if="isAdmin"
        to="/dashboard/costos"
        class="flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition"
        :class="isActive('/dashboard/costos') ? 'text-gold' : 'text-gold-soft/60 hover:text-gold-soft'"
      >
        <Icon name="lucide:calculator" class="size-5" />
        Costeo
      </NuxtLink>

      <NuxtLink
        v-if="isAdmin"
        to="/dashboard/usuarios"
        class="flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium transition"
        :class="isActive('/dashboard/usuarios') ? 'text-gold' : 'text-gold-soft/60 hover:text-gold-soft'"
      >
        <Icon name="lucide:users" class="size-5" />
        Usuarios
      </NuxtLink>

      <NuxtLink
        to="/"
        class="flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-xs font-medium text-gold-soft/60 transition hover:text-gold-soft"
      >
        <Icon name="lucide:flame" class="size-5" />
        Menú
      </NuxtLink>
    </div>
  </nav>
</template>
