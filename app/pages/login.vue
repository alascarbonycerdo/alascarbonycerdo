<script setup lang="ts">
definePageMeta({ middleware: ['guest'] })

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const client = useSupabaseClient()

const submit = async () => {
  error.value = ''
  loading.value = true
  const { error: signInError } = await client.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  })
  loading.value = false

  if (signInError) {
    error.value = 'Correo o contraseña incorrectos'
    return
  }

  await navigateTo('/dashboard')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-ink px-5">
    <form class="w-full max-w-xs space-y-4" @submit.prevent="submit">
      <div class="text-center">
        <p class="font-display text-2xl text-gold">Alas Carbón &amp; Cerdo</p>
        <p class="text-xs uppercase tracking-widest text-ember-soft">Acceso de personal</p>
      </div>

      <div class="space-y-1">
        <label class="text-xs uppercase tracking-widest text-gold-soft/70">Correo</label>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="username"
          class="w-full rounded-xl bg-ink-soft px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </div>

      <div class="space-y-1">
        <label class="text-xs uppercase tracking-widest text-gold-soft/70">Contraseña</label>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="w-full rounded-xl bg-ink-soft px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </div>

      <p v-if="error" class="text-xs text-ember-soft">{{ error }}</p>

      <button
        type="submit"
        :disabled="loading"
        class="w-full rounded-xl bg-gold py-2.5 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
      >
        {{ loading ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
  </div>
</template>
