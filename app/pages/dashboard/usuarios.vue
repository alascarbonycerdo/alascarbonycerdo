<script setup lang="ts">
import type { StaffUser } from '#shared/types/admin'

definePageMeta({ middleware: ['staff', 'admin'], layout: 'dashboard' })

const { users, pending, error, load, createUser, updateUser, deleteUser } = useUsers()
const { activePuntos, load: loadPuntos } = usePuntosVenta()
const currentUser = useSupabaseUser()

await useAsyncData('users-init', () => Promise.all([load(), loadPuntos()]))

const ROLES = [
  { value: 'vendedor', label: 'Vendedor' },
  { value: 'administrador', label: 'Administrador' },
  { value: 'cliente', label: 'Cliente' },
]

const form = reactive({ email: '', password: '', nombre: '', role: 'vendedor', puntoVentaId: '' })
const creating = ref(false)
const createError = ref('')

const submitCreate = async () => {
  createError.value = ''
  creating.value = true
  try {
    await createUser({ ...form, puntoVentaId: form.puntoVentaId || null })
    form.email = ''
    form.password = ''
    form.nombre = ''
    form.role = 'vendedor'
    form.puntoVentaId = ''
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'No se pudo crear el usuario'
  } finally {
    creating.value = false
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

const editingId = ref<string | null>(null)
const editForm = reactive({ nombre: '', role: 'vendedor', email: '', password: '', puntoVentaId: '' })
const saving = ref(false)
const editError = ref('')

const startEdit = (user: StaffUser) => {
  editingId.value = user.id
  editForm.nombre = user.nombre ?? ''
  editForm.role = user.role
  editForm.email = user.email
  editForm.password = ''
  editForm.puntoVentaId = user.puntoVentaId ?? ''
  editError.value = ''
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (id: string) => {
  editError.value = ''
  saving.value = true
  try {
    await updateUser(id, {
      nombre: editForm.nombre,
      role: editForm.role,
      email: editForm.email || undefined,
      password: editForm.password || undefined,
      puntoVentaId: editForm.puntoVentaId || null,
    })
    editingId.value = null
  } catch (e) {
    editError.value = e instanceof Error ? e.message : 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

const deletingId = ref<string | null>(null)
const deleteError = ref('')

const removeUser = async (user: StaffUser) => {
  if (!confirm(`¿Eliminar a ${user.email}? Esta acción no se puede deshacer.`)) return
  deleteError.value = ''
  deletingId.value = user.id
  try {
    await deleteUser(user.id)
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'No se pudo eliminar'
  } finally {
    deletingId.value = null
  }
}
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

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Punto de venta
          <select
            v-model="form.puntoVentaId"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
            <option value="">Sin asignar</option>
            <option v-for="punto in activePuntos" :key="punto.id" :value="punto.id">{{ punto.nombre }}</option>
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
      <p v-if="deleteError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ deleteError }}</p>

      <div class="space-y-2" :class="{ 'opacity-60': pending }">
        <div
          v-for="user in users"
          :key="user.id"
          class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-gold-soft">{{ user.nombre || user.email }}</p>
              <p class="text-xs text-gold-soft/60">
                {{ user.email }} · {{ user.role }}
                <span v-if="user.puntoVentaNombre"> · {{ user.puntoVentaNombre }}</span>
                · desde {{ formatDate(user.createdAt) }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                class="text-xs font-semibold text-gold-soft/70 hover:text-gold"
                @click="editingId === user.id ? cancelEdit() : startEdit(user)"
              >
                {{ editingId === user.id ? 'Cancelar' : 'Editar' }}
              </button>
              <button
                v-if="user.id !== currentUser?.sub"
                type="button"
                :disabled="deletingId === user.id"
                class="text-xs font-semibold text-ember-soft hover:text-ember disabled:opacity-40"
                @click="removeUser(user)"
              >
                {{ deletingId === user.id ? 'Eliminando…' : 'Eliminar' }}
              </button>
            </div>
          </div>

          <div v-if="editingId === user.id" class="grid gap-3 border-t border-gold/10 pt-3 sm:grid-cols-2">
            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Nombre
              <input
                v-model="editForm.nombre"
                type="text"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Rol
              <select
                v-model="editForm.role"
                :disabled="user.id === currentUser?.sub"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 disabled:opacity-40"
              >
                <option v-for="opt in ROLES" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Punto de venta
              <select
                v-model="editForm.puntoVentaId"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
                <option value="">Sin asignar</option>
                <option v-for="punto in activePuntos" :key="punto.id" :value="punto.id">{{ punto.nombre }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Correo
              <input
                v-model="editForm.email"
                type="email"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Nueva contraseña (opcional)
              <input
                v-model="editForm.password"
                type="text"
                minlength="6"
                placeholder="Dejar vacío para no cambiarla"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <div class="sm:col-span-2">
              <p v-if="editError" class="mb-2 text-xs text-ember-soft">{{ editError }}</p>
              <button
                type="button"
                :disabled="saving"
                class="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
                @click="saveEdit(user.id)"
              >
                {{ saving ? 'Guardando…' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </div>

        <p v-if="!pending && !users.length" class="text-sm text-gold-soft/50">No hay usuarios registrados todavía.</p>
      </div>
    </section>
  </div>
</template>
