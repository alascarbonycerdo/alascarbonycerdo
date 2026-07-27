<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format'
import type { Factura } from '#shared/types/factura'

definePageMeta({ middleware: ['staff', 'admin'], layout: 'dashboard' })

const {
  facturas,
  pending,
  error,
  load,
  createFactura,
  updateFactura,
  deleteFactura,
  resumenSemanal,
  resumenMensual,
  resumenPending,
  resumenError,
  loadResumen,
} = useFacturas()
const { activePuntos, load: loadPuntos } = usePuntosVenta()

await useAsyncData('facturas-init', () => Promise.all([load(), loadResumen(), loadPuntos()]))

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())

const form = reactive({ fecha: today, descripcion: '', valor: '', puntoVentaId: '' })
const creating = ref(false)
const createError = ref('')

const submitCreate = async () => {
  createError.value = ''
  creating.value = true
  try {
    await createFactura({
      fecha: form.fecha,
      descripcion: form.descripcion,
      valor: Number(form.valor),
      puntoVentaId: form.puntoVentaId || null,
    })
    form.fecha = today
    form.descripcion = ''
    form.valor = ''
    form.puntoVentaId = ''
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'No se pudo crear la factura'
  } finally {
    creating.value = false
  }
}

const formatFecha = (iso: string) => {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number)
  const asUtc = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(asUtc)
}

const formatSemana = (periodo: string) => {
  const [year = 1970, month = 1, day = 1] = periodo.split('-').map(Number)
  const start = new Date(Date.UTC(year, month - 1, day))
  const end = new Date(start)
  end.setUTCDate(end.getUTCDate() + 6)
  const fmt = (d: Date) => new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d)
  return `${fmt(start)} – ${fmt(end)}`
}

const formatMes = (periodo: string) => {
  const [year = 1970, month = 1] = periodo.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, 1))
  const label = new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const editingId = ref<string | null>(null)
const editForm = reactive({ fecha: '', descripcion: '', valor: '', puntoVentaId: '' })
const saving = ref(false)
const editError = ref('')

const startEdit = (factura: Factura) => {
  editingId.value = factura.id
  editForm.fecha = factura.fecha
  editForm.descripcion = factura.descripcion
  editForm.valor = String(factura.valor)
  editForm.puntoVentaId = factura.puntoVentaId ?? ''
  editError.value = ''
}

const cancelEdit = () => {
  editingId.value = null
}

const saveEdit = async (id: string) => {
  editError.value = ''
  saving.value = true
  try {
    await updateFactura(id, {
      fecha: editForm.fecha,
      descripcion: editForm.descripcion,
      valor: Number(editForm.valor),
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

const removeFactura = async (factura: Factura) => {
  if (!confirm(`¿Eliminar la factura "${factura.descripcion}" del ${formatFecha(factura.fecha)}?`)) return
  deleteError.value = ''
  deletingId.value = factura.id
  try {
    await deleteFactura(factura.id)
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'No se pudo eliminar la factura'
  } finally {
    deletingId.value = null
  }
}
</script>

<template>
  <div class="space-y-10">
    <section class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Nueva factura</h2>
      <form class="grid gap-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10 sm:grid-cols-2" @submit.prevent="submitCreate">
        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Fecha
          <input
            v-model="form.fecha"
            type="date"
            required
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Valor
          <input
            v-model="form.valor"
            type="number"
            min="0"
            step="1000"
            required
            placeholder="Pesos"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60 sm:col-span-2">
          Descripción
          <input
            v-model="form.descripcion"
            type="text"
            required
            placeholder="Ej: Bolsas de alas congeladas"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>

        <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
          Punto de venta (opcional)
          <select
            v-model="form.puntoVentaId"
            class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
            <option value="">Sin asignar</option>
            <option v-for="p in activePuntos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
          </select>
        </label>

        <div class="sm:col-span-2">
          <p v-if="createError" class="mb-2 text-xs text-ember-soft">{{ createError }}</p>
          <button
            type="submit"
            :disabled="creating"
            class="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
          >
            <Icon name="lucide:receipt" class="size-4" />
            {{ creating ? 'Guardando…' : 'Agregar factura' }}
          </button>
        </div>
      </form>
    </section>

    <section class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Facturas registradas</h2>

      <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>
      <p v-if="deleteError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ deleteError }}</p>

      <div class="space-y-2" :class="{ 'opacity-60': pending }">
        <div
          v-for="factura in facturas"
          :key="factura.id"
          class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p class="text-sm font-semibold text-gold-soft">{{ factura.descripcion }}</p>
              <p class="text-xs text-gold-soft/60">
                {{ formatFecha(factura.fecha) }}
                <span v-if="factura.puntoVentaNombre"> · {{ factura.puntoVentaNombre }}</span>
                · <span class="font-semibold text-gold">{{ formatCurrency(factura.valor) }}</span>
              </p>
            </div>

            <div class="flex items-center gap-1.5">
              <div class="group relative">
                <button
                  type="button"
                  class="flex size-8 items-center justify-center rounded-lg text-gold-soft/70 transition hover:bg-ink hover:text-gold"
                  @click="editingId === factura.id ? cancelEdit() : startEdit(factura)"
                >
                  <Icon name="lucide:pencil" class="size-4" />
                </button>
                <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[0.65rem] text-gold-soft opacity-0 ring-1 ring-gold/20 transition group-hover:opacity-100">
                  {{ editingId === factura.id ? 'Cerrar' : 'Editar' }}
                </span>
              </div>

              <button
                type="button"
                :disabled="deletingId === factura.id"
                class="relative flex size-8 items-center justify-center rounded-lg text-ember-soft/80 transition hover:bg-ember/10 hover:text-ember disabled:opacity-40"
                @click="removeFactura(factura)"
              >
                <Icon name="lucide:trash-2" class="size-4" :class="{ invisible: deletingId === factura.id }" />
                <span
                  v-if="deletingId === factura.id"
                  class="absolute size-3.5 animate-spin rounded-full border-2 border-ember-soft/30 border-t-ember"
                />
              </button>
            </div>
          </div>

          <div v-if="editingId === factura.id" class="grid gap-3 border-t border-gold/10 pt-3 sm:grid-cols-2">
            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Fecha
              <input
                v-model="editForm.fecha"
                type="date"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Valor
              <input
                v-model="editForm.valor"
                type="number"
                min="0"
                step="1000"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60 sm:col-span-2">
              Descripción
              <input
                v-model="editForm.descripcion"
                type="text"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
            </label>

            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Punto de venta
              <select
                v-model="editForm.puntoVentaId"
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
              >
                <option value="">Sin asignar</option>
                <option v-for="p in activePuntos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
              </select>
            </label>

            <div class="sm:col-span-2">
              <p v-if="editError" class="mb-2 text-xs text-ember-soft">{{ editError }}</p>
              <button
                type="button"
                :disabled="saving"
                class="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
                @click="saveEdit(factura.id)"
              >
                {{ saving ? 'Guardando…' : 'Guardar cambios' }}
              </button>
            </div>
          </div>
        </div>

        <p v-if="!pending && !facturas.length" class="text-sm text-gold-soft/50">No hay facturas registradas todavía.</p>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Histórico semanal</h2>

      <p v-if="resumenError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ resumenError }}</p>

      <div class="overflow-hidden rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10" :class="{ 'opacity-60': resumenPending }">
        <ul class="divide-y divide-gold/10">
          <li v-for="fila in resumenSemanal" :key="fila.periodo" class="flex items-center justify-between px-4 py-2.5 text-sm">
            <span class="text-gold-soft/70">{{ formatSemana(fila.periodo) }}</span>
            <span class="font-semibold text-gold">{{ formatCurrency(fila.total) }}</span>
          </li>
        </ul>
        <p v-if="!resumenPending && !resumenSemanal.length" class="px-4 py-4 text-sm text-gold-soft/50">
          Todavía no hay compras registradas.
        </p>
      </div>
    </section>

    <section class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Histórico mensual</h2>

      <div class="overflow-hidden rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10" :class="{ 'opacity-60': resumenPending }">
        <ul class="divide-y divide-gold/10">
          <li v-for="fila in resumenMensual" :key="fila.periodo" class="flex items-center justify-between px-4 py-2.5 text-sm">
            <span class="text-gold-soft/70">{{ formatMes(fila.periodo) }}</span>
            <span class="font-semibold text-gold">{{ formatCurrency(fila.total) }}</span>
          </li>
        </ul>
        <p v-if="!resumenPending && !resumenMensual.length" class="px-4 py-4 text-sm text-gold-soft/50">
          Todavía no hay compras registradas.
        </p>
      </div>
    </section>
  </div>
</template>
