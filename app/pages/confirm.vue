<script setup lang="ts">
const user = useSupabaseUser()
const router = useRouter()

watchEffect(() => {
  if (user.value) router.replace('/dashboard')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-ink">
    <p class="text-sm text-gold-soft/70">Confirmando tu acceso…</p>
  </div>
</template>
