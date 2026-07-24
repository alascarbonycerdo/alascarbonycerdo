<script setup lang="ts">
import { BLOOD_TYPES } from '#shared/types/admin'
import type { StaffUser } from '#shared/types/admin'
import { formatCurrency } from '#shared/utils/format'

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

const form = reactive({
  email: '',
  password: '',
  nombre: '',
  role: 'vendedor',
  puntoVentaId: '',
  celular: '',
  documento: '',
  tipoSangre: '',
  tarifaHora: '6000',
})
const creating = ref(false)
const createError = ref('')

const submitCreate = async () => {
  createError.value = ''
  creating.value = true
  try {
    await createUser({
      ...form,
      puntoVentaId: form.puntoVentaId || null,
      celular: form.celular || undefined,
      documento: form.documento || undefined,
      tipoSangre: form.tipoSangre || undefined,
      tarifaHora: form.tarifaHora ? Number(form.tarifaHora) : undefined,
    })
    form.email = ''
    form.password = ''
    form.nombre = ''
    form.role = 'vendedor'
    form.puntoVentaId = ''
    form.celular = ''
    form.documento = ''
    form.tipoSangre = ''
    form.tarifaHora = '6000'
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'No se pudo crear el usuario'
  } finally {
    creating.value = false
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

const editingId = ref<string | null>(null)
const editForm = reactive({
  nombre: '',
  role: 'vendedor',
  email: '',
  password: '',
  puntoVentaId: '',
  celular: '',
  documento: '',
  tipoSangre: '',
  tarifaHora: '',
})
const saving = ref(false)
const editError = ref('')

const startEdit = (user: StaffUser) => {
  editingId.value = user.id
  editForm.nombre = user.nombre ?? ''
  editForm.role = user.role
  editForm.email = user.email
  editForm.password = ''
  editForm.puntoVentaId = user.puntoVentaId ?? ''
  editForm.celular = user.celular ?? ''
  editForm.documento = user.documento ?? ''
  editForm.tipoSangre = user.tipoSangre ?? ''
  editForm.tarifaHora = user.tarifaHora ? String(user.tarifaHora) : ''
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
      celular: editForm.celular,
      documento: editForm.documento,
      tipoSangre: editForm.tipoSangre,
      tarifaHora: editForm.tarifaHora ? Number(editForm.tarifaHora) : 0,
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

const togglingId = ref<string | null>(null)
const toggleError = ref('')

const toggleActivo = async (user: StaffUser) => {
  toggleError.value = ''
  togglingId.value = user.id
  try {
    await updateUser(user.id, { activo: !user.activo })
  } catch (e) {
    toggleError.value = e instanceof Error ? e.message : 'No se pudo cambiar el estado'
  } finally {
    togglingId.value = null
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

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Celular (opcional)
          <input
            v-model="form.celular"
            type="tel"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Documento (opcional)
          <input
            v-model="form.documento"
            type="text"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Tipo de sangre (opcional)
          <select
            v-model="form.tipoSangre"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
            <option value="">Sin especificar</option>
            <option v-for="bt in BLOOD_TYPES" :key="bt" :value="bt">{{ bt }}</option>
          </select>
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Tarifa por hora (opcional)
          <input
            v-model="form.tarifaHora"
            type="number"
            min="0"
            step="500"
            placeholder="Pesos por hora"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
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
      <p v-if="toggleError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ toggleError }}</p>

      <div class="space-y-2" :class="{ 'opacity-60': pending }">
        <div
          v-for="user in users"
          :key="user.id"
          class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="flex items-center gap-2 text-sm font-semibold text-gold-soft">
                {{ user.nombre || user.email }}
                <span
                  class="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide"
                  :class="user.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ember/15 text-ember-soft'"
                >
                  {{ user.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
              <p class="text-xs text-gold-soft/60">
                {{ user.email }} · {{ user.role }}
                <span v-if="user.puntoVentaNombre"> · {{ user.puntoVentaNombre }}</span>
                · desde {{ formatDate(user.createdAt) }}
              </p>
              <p v-if="user.celular || user.documento || user.tipoSangre" class="text-xs text-gold-soft/50">
                <span v-if="user.celular">{{ user.celular }}</span>
                <span v-if="user.documento"> · CC {{ user.documento }}</span>
                <span v-if="user.tipoSangre"> · Tipo {{ user.tipoSangre }}</span>
              </p>
              <p v-if="user.tarifaHora" class="text-xs text-gold-soft/50">{{ formatCurrency(user.tarifaHora) }} / hora</p>
            </div>

            <div class="flex items-center gap-1.5">
              <div class="group relative">
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-lg text-gold-soft/70 transition hover:bg-ink hover:text-gold"
                  @click="editingId === user.id ? cancelEdit() : startEdit(user)"
                >
                  <Icon name="lucide:pencil" class="size-4" />
                </button>
                <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[0.65rem] text-gold-soft opacity-0 ring-1 ring-gold/20 transition group-hover:opacity-100">
                  {{ editingId === user.id ? 'Cancelar' : 'Editar' }}
                </span>
              </div>

              <div v-if="user.id !== currentUser?.sub" class="group relative">
                <button
                  type="button"
                  :disabled="togglingId === user.id"
                  class="relative flex size-8 items-center justify-center rounded-lg text-gold-soft/70 transition hover:bg-ink hover:text-gold disabled:opacity-40"
                  @click="toggleActivo(user)"
                >
                  <Icon name="lucide:power" class="size-4" :class="{ invisible: togglingId === user.id }" />
                  <span
                    v-if="togglingId === user.id"
                    class="absolute size-3.5 animate-spin rounded-full border-2 border-gold-soft/30 border-t-gold"
                  />
                </button>
                <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[0.65rem] text-gold-soft opacity-0 ring-1 ring-gold/20 transition group-hover:opacity-100">
                  {{ togglingId === user.id ? 'Guardando…' : user.activo ? 'Desactivar' : 'Activar' }}
                </span>
              </div>

              <div v-if="user.id !== currentUser?.sub" class="group relative">
                <button
                  type="button"
                  :disabled="deletingId === user.id"
                  class="relative flex size-8 items-center justify-center rounded-lg text-ember-soft/80 transition hover:bg-ember/10 hover:text-ember disabled:opacity-40"
                  @click="removeUser(user)"
                >
                  <Icon name="lucide:trash-2" class="size-4" :class="{ invisible: deletingId === user.id }" />
                  <span
                    v-if="deletingId === user.id"
                    class="absolute size-3.5 animate-spin rounded-full border-2 border-ember-soft/30 border-t-ember"
                  />
                </button>
                <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[0.65rem] text-gold-soft opacity-0 ring-1 ring-gold/20 transition group-hover:opacity-100">
                  {{ deletingId === user.id ? 'Eliminando…' : 'Eliminar' }}
                </span>
              </div>
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

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Celular
              <input
                v-model="editForm.celular"
                type="tel"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Documento
              <input
                v-model="editForm.documento"
                type="text"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Tipo de sangre
              <select
                v-model="editForm.tipoSangre"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
                <option value="">Sin especificar</option>
                <option v-for="bt in BLOOD_TYPES" :key="bt" :value="bt">{{ bt }}</option>
              </select>
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Tarifa por hora
              <input
                v-model="editForm.tarifaHora"
                type="number"
                min="0"
                step="500"
                placeholder="Pesos por hora"
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
