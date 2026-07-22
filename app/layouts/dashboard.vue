<script setup lang="ts">
const { profile, isAdmin } = useProfile()
const client = useSupabaseClient()
const router = useRouter()

const logout = async () => {
  await client.auth.signOut()
  await router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-ink pb-24">
    <div class="mx-auto max-w-2xl px-5 pt-8">
      <header class="flex items-center justify-between">
        <div>
          <p class="font-display text-2xl text-gold">Dashboard</p>
          <p class="text-xs uppercase tracking-widest text-ember-soft">
            {{ profile?.nombre ?? 'Alas Carbón &amp; Cerdo' }} · {{ profile?.role }}
          </p>
        </div>
        <button
          type="button"
          class="text-xs font-medium text-gold-soft/70 underline-offset-4 hover:text-gold hover:underline"
          @click="logout"
        >
          Cerrar sesión
        </button>
      </header>

      <div class="mt-8">
        <slot />
      </div>
    </div>

    <DashboardNav :is-admin="isAdmin" />
  </div>
</template>
