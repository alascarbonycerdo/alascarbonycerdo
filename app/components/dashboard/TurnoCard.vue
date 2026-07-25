<script setup lang="ts">
import { formatDia, formatHora, horasEntreHoras } from '#shared/utils/horario'
import type { Turno } from '#shared/types/horario'

const props = defineProps<{ turno: Turno }>()

const { confirmTurno, deleteTurno } = useHorarios()

const entradaReal = ref(formatHora(props.turno.horaEntradaReal ?? props.turno.horaEntradaProgramada))
const salidaReal = ref(formatHora(props.turno.horaSalidaReal ?? props.turno.horaSalidaProgramada))

const editing = ref(false)

const confirming = ref(false)
const confirmError = ref('')

const submitConfirm = async () => {
  if (!entradaReal.value || !salidaReal.value) return
  const mensaje =
    props.turno.estado === 'confirmado'
      ? '¿Guardar los cambios de este turno ya confirmado?'
      : `¿Confirmar el turno de ${props.turno.empleadoNombre} el ${formatDia(props.turno.dia)}?`
  if (!confirm(mensaje)) return
  confirmError.value = ''
  confirming.value = true
  try {
    await confirmTurno(props.turno.id, entradaReal.value, salidaReal.value)
    editing.value = false
  } catch (e) {
    confirmError.value = e instanceof Error ? e.message : 'No se pudo guardar el turno'
  } finally {
    confirming.value = false
  }
}

const deleting = ref(false)
const deleteError = ref('')

const removeTurno = async () => {
  if (!confirm(`¿Eliminar el turno de ${props.turno.empleadoNombre} el ${formatDia(props.turno.dia)}?`)) return
  deleteError.value = ''
  deleting.value = true
  try {
    await deleteTurno(props.turno.id)
  } catch (e) {
    deleteError.value = e instanceof Error ? e.message : 'No se pudo eliminar el turno'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
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
            @click="editing = !editing"
          >
            <Icon name="lucide:pencil" class="size-4" />
          </button>
          <span class="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[0.65rem] text-gold-soft opacity-0 ring-1 ring-gold/20 transition group-hover:opacity-100">
            {{ editing ? 'Cerrar' : 'Editar' }}
          </span>
        </div>

        <button
          type="button"
          :disabled="deleting"
          class="relative flex size-8 items-center justify-center rounded-lg text-ember-soft/80 transition hover:bg-ember/10 hover:text-ember disabled:opacity-40"
          @click="removeTurno"
        >
          <Icon name="lucide:trash-2" class="size-4" :class="{ invisible: deleting }" />
          <span
            v-if="deleting"
            class="absolute size-3.5 animate-spin rounded-full border-2 border-ember-soft/30 border-t-ember"
          />
        </button>
      </div>
    </div>

    <div v-if="editing" class="grid gap-3 border-t border-gold/10 pt-3 sm:grid-cols-3">
      <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Hora entrada real
        <input
          v-model="entradaReal"
          type="time"
          class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
        >
      </label>
      <label class="flex flex-col gap-1 text-[0.65rem] uppercase tracking-widest text-gold-soft/60">
        Hora salida real
        <input
          v-model="salidaReal"
          type="time"
          class="rounded-lg bg-ink px-2 py-1.5 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50 [color-scheme:dark]"
        >
      </label>
      <div class="flex items-end">
        <button
          type="button"
          :disabled="!entradaReal || !salidaReal || confirming"
          class="w-full rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-30"
          @click="submitConfirm"
        >
          {{ confirming ? 'Guardando…' : turno.estado === 'confirmado' ? 'Guardar cambios' : 'Confirmar turno' }}
        </button>
      </div>
    </div>

    <p v-if="turno.estado === 'confirmado'" class="text-xs text-gold-soft/50">
      {{ horasEntreHoras(turno.horaEntradaReal!, turno.horaSalidaReal!).toFixed(1) }} horas trabajadas
    </p>

    <p v-if="confirmError" class="rounded-xl bg-ember/10 px-3 py-2 text-xs text-ember-soft">{{ confirmError }}</p>
    <p v-if="deleteError" class="rounded-xl bg-ember/10 px-3 py-2 text-xs text-ember-soft">{{ deleteError }}</p>
  </div>
</template>
