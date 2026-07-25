<script setup lang="ts">
import { BLOOD_TYPES } from '#shared/types/admin'
import type { Profile } from '~/composables/useProfile'

definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { profile, fetchProfile, updateProfile, changePassword, uploadAvatar } = useProfile()
const client = useSupabaseClient()
const router = useRouter()

await useAsyncData('perfil-init', () => fetchProfile().then(() => true))

const form = reactive({ nombre: '', celular: '', documento: '', tipoSangre: '' })
watch(
  profile,
  (p: Profile | null) => {
    form.nombre = p?.nombre ?? ''
    form.celular = p?.celular ?? ''
    form.documento = p?.documento ?? ''
    form.tipoSangre = p?.tipo_sangre ?? ''
  },
  { immediate: true },
)

const saving = ref(false)
const saveError = ref('')
const savedOk = ref(false)

const saveProfile = async () => {
  saveError.value = ''
  savedOk.value = false
  saving.value = true
  try {
    await updateProfile({
      nombre: form.nombre.trim(),
      celular: form.celular.trim(),
      documento: form.documento.trim(),
      tipoSangre: form.tipoSangre,
    })
    savedOk.value = true
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'No se pudo guardar el perfil'
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

const passwordForm = reactive({ actual: '', nueva: '', confirmar: '' })
const changingPassword = ref(false)
const passwordError = ref('')
const passwordOk = ref(false)

const submitChangePassword = async () => {
  passwordError.value = ''
  passwordOk.value = false

  if (!passwordForm.actual) {
    passwordError.value = 'Ingresa tu contraseña actual'
    return
  }
  if (passwordForm.nueva.length < 6) {
    passwordError.value = 'La nueva contraseña debe tener al menos 6 caracteres'
    return
  }
  if (passwordForm.nueva !== passwordForm.confirmar) {
    passwordError.value = 'La confirmación no coincide con la nueva contraseña'
    return
  }

  changingPassword.value = true
  try {
    await changePassword(passwordForm.actual, passwordForm.nueva)
    passwordOk.value = true
    passwordForm.actual = ''
    passwordForm.nueva = ''
    passwordForm.confirmar = ''
  } catch (e) {
    passwordError.value = e instanceof Error ? e.message : 'No se pudo cambiar la contraseña'
  } finally {
    changingPassword.value = false
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
        <span v-else class="font-display text-2xl text-ink">{{ form.nombre ? form.nombre.trim()[0]?.toUpperCase() : '?' }}</span>

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
          v-model="form.nombre"
          type="text"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>

      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Celular
        <input
          v-model="form.celular"
          type="tel"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>

      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Documento
        <input
          v-model="form.documento"
          type="text"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>

      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Tipo de sangre
        <select
          v-model="form.tipoSangre"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
          <option value="">Sin especificar</option>
          <option v-for="bt in BLOOD_TYPES" :key="bt" :value="bt">{{ bt }}</option>
        </select>
      </label>

      <p v-if="saveError" class="text-xs text-ember-soft">{{ saveError }}</p>
      <p v-else-if="savedOk" class="text-xs text-gold-soft/60">Guardado.</p>

      <button
        type="button"
        :disabled="saving"
        class="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
        @click="saveProfile"
      >
        {{ saving ? 'Guardando…' : 'Guardar cambios' }}
      </button>
    </section>

    <section class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
      <h2 class="font-display text-lg text-gold">Cambiar contraseña</h2>

      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Contraseña actual
        <input
          v-model="passwordForm.actual"
          type="password"
          autocomplete="current-password"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>

      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Nueva contraseña
        <input
          v-model="passwordForm.nueva"
          type="password"
          minlength="6"
          autocomplete="new-password"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>

      <label class="flex flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
        Confirmar nueva contraseña
        <input
          v-model="passwordForm.confirmar"
          type="password"
          minlength="6"
          autocomplete="new-password"
          class="rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </label>

      <p v-if="passwordError" class="text-xs text-ember-soft">{{ passwordError }}</p>
      <p v-else-if="passwordOk" class="text-xs text-gold-soft/60">Contraseña actualizada.</p>

      <button
        type="button"
        :disabled="changingPassword"
        class="rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
        @click="submitChangePassword"
      >
        {{ changingPassword ? 'Cambiando…' : 'Cambiar contraseña' }}
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
