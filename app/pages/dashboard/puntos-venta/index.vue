<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'
import type { PuntoVentaSummary } from '#shared/types/puntoVenta'

definePageMeta({ middleware: ['staff', 'admin'], layout: 'dashboard' })

const { puntos, pending, error, load, createPunto, updatePunto } = usePuntosVenta()

await useAsyncData('puntos-venta-init', () => load())

const form = reactive({ nombre: '', direccion: '' })
const creating = ref(false)
const createError = ref('')

const submitCreate = async () => {
  createError.value = ''
  creating.value = true
  try {
    await createPunto({ nombre: form.nombre, direccion: form.direccion || undefined })
    form.nombre = ''
    form.direccion = ''
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'No se pudo crear el punto de venta'
  } finally {
    creating.value = false
  }
}

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })

const editingId = ref<string | null>(null)
const editForm = reactive({ nombre: '', direccion: '' })
const saving = ref(false)
const editError = ref('')

const startEdit = (punto: PuntoVentaSummary) => {
  editingId.value = punto.id
  editForm.nombre = punto.nombre
  editForm.direccion = punto.direccion ?? ''
  editError.value = ''
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (id: string) => {
  editError.value = ''
  saving.value = true
  try {
    await updatePunto(id, { nombre: editForm.nombre, direccion: editForm.direccion })
    editingId.value = null
  } catch (e) {
    editError.value = e instanceof Error ? e.message : 'No se pudo guardar'
  } finally {
    saving.value = false
  }
}

const togglingId = ref<string | null>(null)
const toggleError = ref('')

const toggleActivo = async (punto: PuntoVentaSummary) => {
  toggleError.value = ''
  togglingId.value = punto.id
  try {
    await updatePunto(punto.id, { activo: !punto.activo })
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
      <h2 class="font-display text-2xl text-gold">Nuevo punto de venta</h2>
      <form class="grid gap-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10 sm:grid-cols-2" @submit.prevent="submitCreate">
        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Nombre
          <input
            v-model="form.nombre"
            type="text"
            required
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Dirección (opcional)
          <input
            v-model="form.direccion"
            type="text"
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
            <Icon name="lucide:store" class="size-4" />
            {{ creating ? 'Creando…' : 'Crear punto de venta' }}
          </button>
        </div>
      </form>
    </section>

    <section class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Puntos de venta</h2>

      <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>
      <p v-if="toggleError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ toggleError }}</p>

      <div class="space-y-3" :class="{ 'opacity-60': pending }">
        <div
          v-for="punto in puntos"
          :key="punto.id"
          class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="flex items-center gap-2 text-sm font-semibold text-gold-soft">
                {{ punto.nombre }}
                <span
                  class="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide"
                  :class="punto.activo ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ember/15 text-ember-soft'"
                >
                  {{ punto.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </p>
              <p class="text-xs text-gold-soft/60">
                <span v-if="punto.direccion">{{ punto.direccion }} · </span>
                {{ punto.vendedoresCount }} vendedor{{ punto.vendedoresCount === 1 ? '' : 'es' }} · desde {{ formatDate(punto.createdAt) }}
              </p>
            </div>

            <div class="flex items-center gap-3">
              <button
                type="button"
                class="text-xs font-semibold text-gold-soft/70 hover:text-gold"
                @click="editingId === punto.id ? cancelEdit() : startEdit(punto)"
              >
                {{ editingId === punto.id ? 'Cancelar' : 'Editar' }}
              </button>
              <button
                type="button"
                :disabled="togglingId === punto.id"
                class="text-xs font-semibold text-ember-soft hover:text-ember disabled:opacity-40"
                @click="toggleActivo(punto)"
              >
                {{ togglingId === punto.id ? 'Guardando…' : punto.activo ? 'Desactivar' : 'Activar' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <StatTile label="Ventas de hoy" :value="formatCOP(punto.todayRevenueThousands)" />
            <StatTile label="Stock bajo" :value="String(punto.lowStockCount)" :tone="punto.lowStockCount > 0 ? 'ember' : 'gold'" />
          </div>

          <div v-if="editingId === punto.id" class="grid gap-3 border-t border-gold/10 pt-3 sm:grid-cols-2">
            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Nombre
              <input
                v-model="editForm.nombre"
                type="text"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Dirección
              <input
                v-model="editForm.direccion"
                type="text"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <div class="sm:col-span-2">
              <p v-if="editError" class="mb-2 text-xs text-ember-soft">{{ editError }}</p>
              <button
                type="button"
                :disabled="saving"
                class="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
                @click="saveEdit(punto.id)"
              >
                {{ saving ? 'Guardando…' : 'Guardar cambios' }}
              </button>
            </div>
          </div>

          <NuxtLink
            :to="`/dashboard/puntos-venta/${punto.id}`"
            class="flex items-center gap-1 text-xs font-semibold text-gold hover:text-gold-soft"
          >
            Ver panel completo
            <Icon name="lucide:arrow-right" class="size-3.5" />
          </NuxtLink>
        </div>

        <p v-if="!pending && !puntos.length" class="text-sm text-gold-soft/50">No hay puntos de venta todavía.</p>
      </div>
    </section>
  </div>
</template>
