<script setup lang="ts">
import { formatCurrency } from '#shared/utils/format'
import type { ResumenPagoEmpleado, Turno } from '#shared/types/horario'

definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { isAdmin } = useProfile()
const currentUser = useSupabaseUser()

const {
  turnos,
  pending,
  error,
  load,
  createTurno,
  confirmTurno,
  deleteTurno,
  resumen,
  resumenPending,
  resumenError,
  loadResumen,
} = useHorarios()
const { users, load: loadUsers, updateUser } = useUsers()
const { activePuntos, load: loadPuntos } = usePuntosVenta()

const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
const primerDiaMes = `${today.slice(0, 7)}-01`
const rangoDesde = ref(primerDiaMes)
const rangoHasta = ref(today)

await useAsyncData('horarios-init', async () => {
  const tasks = [load()]
  if (isAdmin.value) {
    tasks.push(loadUsers(), loadPuntos(), loadResumen(rangoDesde.value, rangoHasta.value))
  }
  await Promise.all(tasks)
  return true
})

watch([rangoDesde, rangoHasta], () => {
  if (rangoDesde.value && rangoHasta.value) loadResumen(rangoDesde.value, rangoHasta.value)
})

const empleadosActivos = computed(() => users.value.filter((u) => u.activo))

const form = reactive({
  empleadoId: '',
  puntoVentaId: '',
  dia: '',
  horaEntradaProgramada: '',
  horaSalidaProgramada: '',
})
const creating = ref(false)
const createError = ref('')

const submitCreate = async () => {
  createError.value = ''
  creating.value = true
  try {
    await createTurno({ ...form })
    form.empleadoId = ''
    form.puntoVentaId = ''
    form.dia = ''
    form.horaEntradaProgramada = ''
    form.horaSalidaProgramada = ''
  } catch (e) {
    createError.value = e instanceof Error ? e.message : 'No se pudo crear el turno'
  } finally {
    creating.value = false
  }
}

const formatDia = (iso: string) => {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number)
  const asUtc = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(asUtc)
}

const formatHora = (time: string) => time.slice(0, 5)

const horasEntreHoras = (entrada: string, salida: string) => {
  const [eh = 0, em = 0] = entrada.split(':').map(Number)
  const [sh = 0, sm = 0] = salida.split(':').map(Number)
  let horas = sh + sm / 60 - (eh + em / 60)
  if (horas < 0) horas += 24
  return horas
}

const entradaReal = reactive<Record<string, string>>({})
const salidaReal = reactive<Record<string, string>>({})

// Precarga los campos de hora real con la hora programada al crear el turno (o
// con la hora real ya guardada, si el turno ya fue confirmado antes), así el
// admin no tiene que escribir desde cero si el turno salió como se planeó.
watch(
  turnos,
  (list: Turno[]) => {
    for (const t of list) {
      if (entradaReal[t.id] === undefined) {
        entradaReal[t.id] = formatHora(t.horaEntradaReal ?? t.horaEntradaProgramada)
      }
      if (salidaReal[t.id] === undefined) {
        salidaReal[t.id] = formatHora(t.horaSalidaReal ?? t.horaSalidaProgramada)
      }
    }
  },
  { immediate: true },
)

const editingTurnoId = ref<string | null>(null)
const toggleEditTurno = (id: string) => {
  editingTurnoId.value = editingTurnoId.value === id ? null : id
}

const confirmingId = ref<string | null>(null)
const confirmError = ref('')

const submitConfirm = async (turno: Turno) => {
  const entrada = entradaReal[turno.id]
  const salida = salidaReal[turno.id]
  if (!entrada || !salida) return
  const mensaje =
    turno.estado === 'confirmado'
      ? `¿Guardar los cambios de este turno ya confirmado?`
      : `¿Confirmar el turno de ${turno.empleadoNombre} el ${formatDia(turno.dia)}?`
  if (!confirm(mensaje)) return
  confirmError.value = ''
  confirmingId.value = turno.id
  try {
    await confirmTurno(turno.id, entrada, salida)
  } catch (e) {
    confirmError.value = e instanceof Error ? e.message : 'No se pudo guardar el turno'
  } finally {
    confirmingId.value = null
  }
}

const deletingId = ref<string | null>(null)
const deleteError = ref('')

const removeTurno = async (turno: Turno) => {
  if (!confirm(`¿Eliminar el turno de ${turno.empleadoNombre} el ${formatDia(turno.dia)}?`)) return
  deleteError.value = ''
  deletingId.value = turno.id
  try {
    await deleteTurno(turno.id)
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'No se pudo eliminar el turno'
  } finally {
    deletingId.value = null
  }
}

const misTurnos = computed(() => turnos.value.filter((t) => t.empleadoId === currentUser.value?.sub))

const tarifaEdit = reactive<Record<string, string>>({})

watch(
  resumen,
  (list: ResumenPagoEmpleado[]) => {
    for (const fila of list) {
      tarifaEdit[fila.empleadoId] = String(fila.tarifaHora)
    }
  },
  { immediate: true },
)

const savingTarifaId = ref<string | null>(null)
const tarifaError = ref('')

const saveTarifa = async (empleadoId: string) => {
  const value = Number(tarifaEdit[empleadoId])
  if (Number.isNaN(value) || value < 0) return
  tarifaError.value = ''
  savingTarifaId.value = empleadoId
  try {
    await updateUser(empleadoId, { tarifaHora: value })
  } catch (e) {
    tarifaError.value = e instanceof Error ? e.message : 'No se pudo guardar la tarifa'
  } finally {
    savingTarifaId.value = null
  }
}
</script>

<template>
  <div class="space-y-10">
    <template v-if="isAdmin">
      <section class="space-y-3">
        <h2 class="font-display text-2xl text-gold">Nuevo turno</h2>
        <form class="grid gap-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10 sm:grid-cols-2" @submit.prevent="submitCreate">
          <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            Empleado
            <select
              v-model="form.empleadoId"
              required
              class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
            >
              <option value="" disabled>Selecciona un empleado</option>
              <option v-for="u in empleadosActivos" :key="u.id" :value="u.id">{{ u.nombre || u.email }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            Punto de venta
            <select
              v-model="form.puntoVentaId"
              required
              class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
            >
              <option value="" disabled>Selecciona un punto</option>
              <option v-for="p in activePuntos" :key="p.id" :value="p.id">{{ p.nombre }}</option>
            </select>
          </label>

          <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            Día
            <input
              v-model="form.dia"
              type="date"
              required
              class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
            >
          </label>

          <div class="grid grid-cols-2 gap-2">
            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Hora entrada
              <input
                v-model="form.horaEntradaProgramada"
                type="time"
                required
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
              >
            </label>
            <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
              Hora salida
              <input
                v-model="form.horaSalidaProgramada"
                type="time"
                required
                class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
              >
            </label>
          </div>

          <div class="sm:col-span-2">
            <p v-if="createError" class="mb-2 text-xs text-ember-soft">{{ createError }}</p>
            <button
              type="submit"
              :disabled="creating"
              class="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
            >
              <Icon name="lucide:calendar-plus" class="size-4" />
              {{ creating ? 'Creando…' : 'Crear turno' }}
            </button>
          </div>
        </form>
      </section>

      <section class="space-y-3">
        <h2 class="font-display text-2xl text-gold">Turnos</h2>

        <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>
        <p v-if="confirmError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ confirmError }}</p>
        <p v-if="deleteError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ deleteError }}</p>

        <div class="space-y-2" :class="{ 'opacity-60': pending }">
          <div
            v-for="turno in turnos"
            :key="turno.id"
            class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p class="flex items-center gap-2 text-sm font-semibold text-gold-soft">
                  {{ turno.empleadoNombre }}
                  <span
                    class="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide"
                    :class="turno.estado === 'confirmado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ember/15 text-ember-soft'"
                  >
                    {{ turno.estado === 'confirmado' ? 'Confirmado' : 'Programado' }}
                  </span>
                </p>
                <p class="text-sm text-gold-soft/70">
                  {{ formatDia(turno.dia) }} · {{ turno.puntoVentaNombre }} ·
                  {{ formatHora(turno.horaEntradaProgramada) }}–{{ formatHora(turno.horaSalidaProgramada) }} programado
                </p>
              </div>

              <div class="flex items-center gap-1.5">
                <div class="group relative">
                  <button
                    type="button"
                    class="flex size-8 items-center justify-center rounded-lg text-gold-soft/70 transition hover:bg-ink hover:text-gold"
                    @click="toggleEditTurno(turno.id)"
                  >
                    <Icon name="lucide:pencil" class="size-4" />
                  </button>
                  <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[0.65rem] text-gold-soft opacity-0 ring-1 ring-gold/20 transition group-hover:opacity-100">
                    {{ editingTurnoId === turno.id ? 'Cerrar' : 'Editar' }}
                  </span>
                </div>

                <button
                  type="button"
                  :disabled="deletingId === turno.id"
                  class="relative flex size-8 items-center justify-center rounded-lg text-ember-soft/80 transition hover:bg-ember/10 hover:text-ember disabled:opacity-40"
                  @click="removeTurno(turno)"
                >
                  <Icon name="lucide:trash-2" class="size-4" :class="{ invisible: deletingId === turno.id }" />
                  <span
                    v-if="deletingId === turno.id"
                    class="absolute size-3.5 animate-spin rounded-full border-2 border-ember-soft/30 border-t-ember"
                  />
                </button>
              </div>
            </div>

            <div v-if="editingTurnoId === turno.id" class="grid gap-3 border-t border-gold/10 pt-3 sm:grid-cols-3">
              <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
                Hora entrada real
                <input
                  v-model="entradaReal[turno.id]"
                  type="time"
                  class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
                >
              </label>
              <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
                Hora salida real
                <input
                  v-model="salidaReal[turno.id]"
                  type="time"
                  class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
                >
              </label>
              <div class="flex items-end">
                <button
                  type="button"
                  :disabled="!entradaReal[turno.id] || !salidaReal[turno.id] || confirmingId === turno.id"
                  class="w-full rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-30"
                  @click="submitConfirm(turno)"
                >
                  {{
                    confirmingId === turno.id
                      ? 'Guardando…'
                      : turno.estado === 'confirmado'
                        ? 'Guardar cambios'
                        : 'Confirmar turno'
                  }}
                </button>
              </div>
            </div>

            <p v-if="turno.estado === 'confirmado'" class="text-xs text-gold-soft/50">
              {{ horasEntreHoras(turno.horaEntradaReal!, turno.horaSalidaReal!).toFixed(1) }} horas trabajadas
            </p>
          </div>

          <p v-if="!pending && !turnos.length" class="text-sm text-gold-soft/50">No hay turnos creados todavía.</p>
        </div>
      </section>

      <section class="space-y-3">
        <h2 class="font-display text-2xl text-gold">Resumen de pago</h2>

        <div class="flex flex-wrap items-center gap-2">
          <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            Desde
            <input
              v-model="rangoDesde"
              type="date"
              class="rounded-lg bg-ink-soft/40 px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/10 focus:outline-none focus:ring-gold/40 [color-scheme:dark]"
            >
          </label>
          <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
            Hasta
            <input
              v-model="rangoHasta"
              type="date"
              class="rounded-lg bg-ink-soft/40 px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/10 focus:outline-none focus:ring-gold/40 [color-scheme:dark]"
            >
          </label>
        </div>

        <p v-if="resumenError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ resumenError }}</p>
        <p v-if="tarifaError" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ tarifaError }}</p>

        <div class="overflow-x-auto rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10" :class="{ 'opacity-60': resumenPending }">
          <table class="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr class="text-xs uppercase tracking-widest text-gold-soft/60">
                <th class="px-4 py-2 font-medium">Empleado</th>
                <th class="px-4 py-2 font-medium">Horas</th>
                <th class="px-4 py-2 font-medium">Valor hora</th>
                <th class="px-4 py-2 font-medium">Total a pagar</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gold/10 tabular-nums">
              <tr v-for="fila in resumen" :key="fila.empleadoId">
                <td class="px-4 py-2 text-gold-soft">{{ fila.empleadoNombre }}</td>
                <td class="px-4 py-2 text-gold-soft">{{ fila.horasTotales.toFixed(1) }}</td>
                <td class="px-4 py-2">
                  <div class="flex items-center gap-1.5">
                    <input
                      v-model="tarifaEdit[fila.empleadoId]"
                      type="number"
                      min="0"
                      step="500"
                      class="w-24 rounded-lg bg-ink px-2 py-1 text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
                      @change="saveTarifa(fila.empleadoId)"
                    >
                    <span
                      v-if="savingTarifaId === fila.empleadoId"
                      class="size-3.5 shrink-0 animate-spin rounded-full border-2 border-gold-soft/30 border-t-gold"
                    />
                  </div>
                </td>
                <td class="px-4 py-2 font-semibold text-gold">{{ formatCurrency(fila.totalPagar) }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="!resumenPending && !resumen.length" class="px-4 py-4 text-sm text-gold-soft/50">
            No hay turnos confirmados en este rango de fechas.
          </p>
        </div>
      </section>
    </template>

    <section v-else class="space-y-3">
      <h2 class="font-display text-2xl text-gold">Mis turnos</h2>

      <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>

      <div class="space-y-2" :class="{ 'opacity-60': pending }">
        <div
          v-for="turno in misTurnos"
          :key="turno.id"
          class="space-y-1 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
        >
          <p class="flex items-center gap-2 text-sm font-semibold text-gold-soft">
            {{ formatDia(turno.dia) }}
            <span
              class="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide"
              :class="turno.estado === 'confirmado' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-ember/15 text-ember-soft'"
            >
              {{ turno.estado === 'confirmado' ? 'Confirmado' : 'Programado' }}
            </span>
          </p>
          <p class="text-xs text-gold-soft/60">
            {{ turno.puntoVentaNombre }} · {{ formatHora(turno.horaEntradaProgramada) }}–{{ formatHora(turno.horaSalidaProgramada) }}
          </p>
          <p v-if="turno.estado === 'confirmado'" class="text-xs text-gold-soft/50">
            Real: {{ formatHora(turno.horaEntradaReal!) }}–{{ formatHora(turno.horaSalidaReal!) }}
          </p>
        </div>

        <p v-if="!pending && !misTurnos.length" class="text-sm text-gold-soft/50">No tienes turnos asignados todavía.</p>
      </div>
    </section>
  </div>
</template>
