<script setup lang="ts">
definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { profile, fetchProfile, updateNombre, uploadAvatar } = useProfile()
const client = useSupabaseClient()
const router = useRouter()

await useAsyncData('perfil-init', () => fetchProfile().then(() => true))

const nombre = ref(profile.value?.nombre ?? '')
watch(profile, (p) => {
  nombre.value = p?.nombre ?? ''
})

const saving = ref(false)
const saveError = ref('')
const savedOk = ref(false)

const saveNombre = async () => {
  saveError.value = ''
  savedOk.value = false
  saving.value = true
  try {
    await updateNombre(nombre.value.trim())
    savedOk.value = true
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'No se pudo guardar el nombre'
  } finally {
    saving.value = false
  }
}

const uploading = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadError.value = ''
  uploading.value = true
  try {
    await uploadAvatar(file)
  } catch (e) {
    uploadError.value = e instanceof Error ? e.message : 'No se pudo subir la imagen'
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

const loggingOut = ref(false)
const logout = async () => {
  loggingOut.value = true
  await client.auth.signOut()
  await router.push('/login')
}
</script>

<template>
  <div class="space-y-8">
    <section class="flex flex-col items-center gap-3">
      <button
        type="button"
        class="group relative flex size-24 items-center justify-center overflow-hidden rounded-full bg-gold ring-2 ring-gold/30 transition hover:ring-gold/60"
        :disabled="uploading"
        @click="fileInput?.click()"
      >
        <img v-if="profile?.avatar_url" :src="profile.avatar_url" alt="" class="size-full object-cover">
        <span v-else class="font-display text-2xl text-ink">{{ nombre ? nombre.trim()[0]?.toUpperCase() : '?' }}</span>

        <span class="absolute inset-0 flex items-center justify-center bg-ink/60 opacity-0 transition group-hover:opacity-100">
          <Icon name="lucide:camera" class="size-6 text-gold" />
        </span>
      </button>
      <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onFileChange">
      <p class="text-xs text-gold-soft/60">{{ uploading ? 'Subiendo…' : 'Toca la foto para cambiarla' }}</p>
      <p v-if="uploadError" class="text-xs text-ember-soft">{{ uploadError }}</p>
    </section>

    <section class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <h2 class="font-display text-lg text-gold">Mi perfil</h2>

      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Nombre
        <input
          v-model="nombre"
          type="text"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>

      <p v-if="saveError" class="text-xs text-ember-soft">{{ saveError }}</p>
      <p v-else-if="savedOk" class="text-xs text-gold-soft/60">Guardado.</p>

      <button
        type="button"
        :disabled="saving"
        class="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
        @click="saveNombre"
      >
        {{ saving ? 'Guardando…' : 'Guardar cambios' }}
      </button>
    </section>

    <button
      type="button"
      :disabled="loggingOut"
      class="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-soft/60 py-2.5 text-sm font-semibold text-ember-soft ring-1 ring-ember/30 transition hover:bg-ink-soft disabled:opacity-60"
      @click="logout"
    >
      <Icon name="lucide:log-out" class="size-4" />
      Cerrar sesión
    </button>
  </div>
</template>
