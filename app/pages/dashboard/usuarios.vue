<script setup lang="ts">
definePageMeta({ middleware: ['staff', 'admin'], layout: 'dashboard' })

const { users, pending, error, load, createUser, updateRole } = useUsers()
const currentUser = useSupabaseUser()

await useAsyncData('users-init', () => load())

const ROLES = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'cliente', label: 'Cliente' },
]

const form = reactive({ email: '', password: '', nombre: '', role: 'vendedor' })
const creating = ref(false)
const createError = ref('')

const submitCreate = async () => {
  createError.value = ''
  creating.value = true
  try {
    await createUser({ ...form })
    form.email = ''
    form.password = ''
    form.nombre = ''
    form.role = 'vendedor'
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'No se pudo crear el usuario'
  } finally {
    creating.value = false
  }
}

const changingId = ref<string | null>(null)

const onRoleChange = async (id: string, role: string) => {
  changingId.value = id
  try {
    await updateRole(id, role)
  } finally {
    changingId.value = null
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
</script>

<template>
  <div class="space-y-10">
    <section class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Nuevo usuario</h2>
      <form class="grid gap-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10 sm:grid-cols-2" @submit.prevent="submitCreate">
        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Correo
          <input
            v-model="form.email"
            type="email"
            required
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Contraseña temporal
          <input
            v-model="form.password"
            type="text"
            required
            minlength="6"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Nombre (opcional)
          <input
            v-model="form.nombre"
            type="text"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Rol
          <select
            v-model="form.role"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
            <option v-for="opt in ROLES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </label>

        <div class="sm:col-span-2">
          <p v-if="createError" class="mb-2 text-xs text-ember-soft">{{ createError }}</p>
          <button
            type="submit"
            :disabled="creating"
            class="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
          >
            <Icon name="lucide:user-plus" class="size-4" />
            {{ creating ? 'Creando…' : 'Crear usuario' }}
          </button>
        </div>
      </form>
    </section>

    <section class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Usuarios registrados</h2>

      <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>

      <div class="space-y-2" :class="{ 'opacity-60': pending }">
        <div
          v-for="user in users"
          :key="user.id"
          class="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
        >
          <div>
            <p class="text-sm font-semibold text-gold-soft">{{ user.nombre || user.email }}</p>
            <p class="text-xs text-gold-soft/60">{{ user.email }} · desde {{ formatDate(user.createdAt) }}</p>
          </div>

          <select
            :value="user.role"
            :disabled="user.id === currentUser?.sub || changingId === user.id"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 disabled:opacity-40"
            @change="onRoleChange(user.id, ($event.target as HTMLSelectElement).value)"
          >
            <option v-for="opt in ROLES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>

        <p v-if="!pending && !users.length" class="text-sm text-gold-soft/50">No hay usuarios registrados todavía.</p>
      </div>
    </section>
  </div>
</template>
