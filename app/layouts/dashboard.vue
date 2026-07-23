<script setup lang="ts">
const { profile, isAdmin, puntoVentaNombre } = useProfile()
</script>

<template>
  <div class="min-h-screen bg-ink pb-24">
    <div class="mx-auto max-w-2xl px-5 pt-8">
      <header class="flex items-center justify-between">
        <div>
          <p class="font-display text-2xl text-gold">Dashboard</p>
          <p class="text-xs uppercase tracking-widest text-ember-soft">
            {{ profile?.nombre ?? 'Alas Carbón &amp; Cerdo' }} · {{ profile?.role }}
            <span v-if="puntoVentaNombre"> · {{ puntoVentaNombre }}</span>
          </p>
        </div>
        <NuxtLink to="/dashboard/perfil" aria-label="Mi perfil">
          <UserAvatar :nombre="profile?.nombre" :avatar-url="profile?.avatar_url" />
        </NuxtLink>
      </header>

      <div class="mt-8">
        <slot />
      </div>
    </div>

    <DashboardNav :is-admin="isAdmin" />
  </div>
</template>
