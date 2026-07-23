<script setup lang="ts">
definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

interface ChecklistItem {
  id: string
  label: string
}

const checklist: ChecklistItem[] = [
  { id: 'c1', label: 'Cero producto del día anterior en barril o nevera sin rotular' },
  { id: 'c2', label: 'Superficies desinfectadas: mesón, tablas, pinzas, termómetro limpio' },
  { id: 'c3', label: 'Foto del área limpia enviada al grupo WhatsApp antes de salir' },
]

const checked = reactive<Record<string, boolean>>({})
const initials = reactive<Record<string, string>>({})

const storageKey = (id: string) => `alas_higiene_${id}`

onMounted(() => {
  for (const item of checklist) {
    checked[item.id] = localStorage.getItem(storageKey(item.id)) === '1'
    initials[item.id] = localStorage.getItem(`${storageKey(item.id)}_init`) ?? ''
  }
})

watch(checked, (value) => {
  if (!import.meta.client) return
  for (const [id, isChecked] of Object.entries(value)) {
    localStorage.setItem(storageKey(id), isChecked ? '1' : '0')
  }
}, { deep: true })

watch(initials, (value) => {
  if (!import.meta.client) return
  for (const [id, text] of Object.entries(value)) {
    localStorage.setItem(`${storageKey(id)}_init`, text)
  }
}, { deep: true })

const printPage = () => window.print()

const meta = reactive({ fecha: '', turno: '', responsable: '' })

onMounted(() => {
  meta.fecha = localStorage.getItem('alas_higiene_meta_fecha') ?? ''
  meta.turno = localStorage.getItem('alas_higiene_meta_turno') ?? ''
  meta.responsable = localStorage.getItem('alas_higiene_meta_responsable') ?? ''
})

watch(meta, (value) => {
  if (!import.meta.client) return
  localStorage.setItem('alas_higiene_meta_fecha', value.fecha)
  localStorage.setItem('alas_higiene_meta_turno', value.turno)
  localStorage.setItem('alas_higiene_meta_responsable', value.responsable)
}, { deep: true })
</script>

<template>
  <div class="higiene-page space-y-6">
    <div class="flex items-start justify-between gap-3">
      <div>
        <span class="inline-flex items-center gap-1.5 rounded-full border border-ember/30 bg-ember/10 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-ember-soft">
          <Icon name="lucide:shield-check" class="size-3.5" />
          Protocolo obligatorio
        </span>
        <h2 class="mt-2 font-display text-2xl text-gold">Manual de Higiene</h2>
        <p class="text-xs text-gold-soft/60">Parador Caballo Loco · Medellín — Cumplimiento Decreto 3075 de 1997</p>
      </div>
      <button
        type="button"
        class="print-hide flex shrink-0 items-center gap-2 rounded-xl bg-gold px-3 py-2 text-xs font-semibold text-ink transition hover:bg-gold-soft"
        @click="printPage"
      >
        <Icon name="lucide:printer" class="size-4" />
        Imprimir
      </button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <!-- 1. Presentación personal -->
      <section class="hig-card rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
        <h3 class="flex items-center gap-2 font-display text-base uppercase tracking-wide text-ember-soft">
          <Icon name="lucide:users" class="size-4 text-ember" />
          1. Presentación personal
        </h3>
        <ul class="mt-3 space-y-2">
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Cabello recogido</strong> con gorra o cofia siempre.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Barba cubierta</strong> con cubrebarbas obligatorio.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Uñas cortas</strong>, sin esmalte, sin postizas.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Uniforme limpio diario</strong> + delantal limpio.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Cero joyas</strong>: anillos, relojes, pulseras, aretes largos.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Lavado de manos cada 30 min</strong> con reloj interno.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Después de <strong class="text-gold-soft">tocar dinero/celular</strong>: lavar inmediato.</span>
          </li>
        </ul>
      </section>

      <!-- 2. Limpieza del barril -->
      <section class="hig-card rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
        <h3 class="flex flex-wrap items-center gap-2 font-display text-base uppercase tracking-wide text-ember-soft">
          <Icon name="lucide:flame" class="size-4 text-ember" />
          2. Limpieza del barril
          <span class="ml-auto rounded-md border border-ember/30 bg-ink px-2 py-0.5 text-[0.65rem] font-bold normal-case tracking-normal text-ember-soft">
            7:00 - 8:30 am
          </span>
        </h3>
        <ul class="mt-3 space-y-2">
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Retirar <strong class="text-gold-soft">ceniza completamente</strong> del día anterior.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Lavar parrillas y ganchos con <strong class="text-gold-soft">agua caliente</strong> y desengrasante.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Desinfectar superficies, bandejas y tablas.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Verificar temperatura interna <code class="hig-temp">&gt;75°C</code> para cerdo con termómetro.</span>
          </li>
        </ul>
      </section>

      <!-- 3. Manipulación -->
      <section class="hig-card rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
        <h3 class="flex items-center gap-2 font-display text-base uppercase tracking-wide text-ember-soft">
          <Icon name="lucide:utensils-crossed" class="size-4 text-ember" />
          3. Manipulación
        </h3>
        <ul class="mt-3 space-y-2">
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Usar <strong class="text-gold-soft">pinzas, nunca manos</strong> directas.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Separar crudo de cocido</strong>: tablas, cuchillos y zonas distintas.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Papada precocida mantener a <code class="hig-temp">&gt;65°C</code> máximo 4 horas.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Si sobra: refrigerar <code class="hig-temp">&lt;4°C</code> en menos de 2h, tapado y fechado.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">Nunca recalentar más de una vez.</strong> Se desecha.</span>
          </li>
        </ul>
      </section>

      <!-- 4. Área de trabajo -->
      <section class="hig-card rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
        <h3 class="flex items-center gap-2 font-display text-base uppercase tracking-wide text-ember-soft">
          <Icon name="lucide:layout-grid" class="size-4 text-ember" />
          4. Área de trabajo
        </h3>
        <ul class="mt-3 space-y-2">
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Limpiar y desinfectar <strong class="text-gold-soft">cada hora</strong> superficies.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span>Bote de basura <strong class="text-gold-soft">con tapa y pedal</strong>, bolsa siempre puesta.</span>
          </li>
          <li class="flex items-start gap-2 text-[13px] text-gold-soft/85">
            <Icon name="lucide:check" class="mt-0.5 size-4 shrink-0 text-ember" />
            <span><strong class="text-gold-soft">No dejar alimentos al aire</strong>. Todo tapado o en vitrina.</span>
          </li>
        </ul>
        <p class="mt-3 rounded-lg border border-dashed border-gold/20 bg-ink px-2.5 py-2 text-[11px] text-gold-soft/60">
          Tip: Paños de colores — Rojo: crudo / Verde: cocido / Azul: superficies
        </p>
      </section>

      <!-- 5. Checklist de cierre -->
      <section class="hig-card rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10 sm:col-span-2">
        <h3 class="flex items-center gap-2 font-display text-base uppercase tracking-wide text-ember-soft">
          <Icon name="lucide:clipboard-check" class="size-4 text-ember" />
          5. Control final — Checklist de cierre
        </h3>
        <div class="mt-3 space-y-2">
          <label
            v-for="item in checklist"
            :key="item.id"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 ring-gold/10 transition hover:bg-ink"
            :class="checked[item.id] ? 'bg-ink' : 'bg-ink/60'"
          >
            <input
              v-model="checked[item.id]"
              type="checkbox"
              class="size-[18px] shrink-0 accent-gold"
            >
            <span class="flex-1 text-[13px] font-medium text-gold-soft">{{ item.label }}</span>
            <input
              v-model="initials[item.id]"
              type="text"
              maxlength="4"
              placeholder="INIC"
              class="print-hide w-14 border-b border-dashed border-gold/30 bg-transparent text-center text-[11px] uppercase text-gold-soft/70 focus:outline-none focus:border-gold/60"
            >
          </label>
        </div>
      </section>
    </div>

    <div class="rounded-2xl border border-ember/30 bg-gradient-to-r from-ember/10 to-gold/10 p-4 text-center">
      <p class="font-display text-lg text-ember-soft">Un pelo en el plato cierra el negocio.</p>
      <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-soft/60">La higiene es nuestra marca.</p>
    </div>

    <div class="grid grid-cols-1 gap-2 text-xs text-gold-soft/60 sm:grid-cols-3">
      <label class="flex flex-col gap-1">
        Fecha
        <input v-model="meta.fecha" type="date" class="rounded-lg bg-ink-soft/40 px-2 py-1.5 text-gold-soft ring-1 ring-gold/10 focus:outline-none focus:ring-gold/40 [color-scheme:dark]">
      </label>
      <label class="flex flex-col gap-1">
        Turno
        <input v-model="meta.turno" type="text" placeholder="AM / PM" class="rounded-lg bg-ink-soft/40 px-2 py-1.5 text-gold-soft ring-1 ring-gold/10 focus:outline-none focus:ring-gold/40">
      </label>
      <label class="flex flex-col gap-1">
        Responsable cierre
        <input v-model="meta.responsable" type="text" class="rounded-lg bg-ink-soft/40 px-2 py-1.5 text-gold-soft ring-1 ring-gold/10 focus:outline-none focus:ring-gold/40">
      </label>
    </div>
    <p class="text-center text-[10px] text-gold-soft/40">Versión 1.0 — Decreto 3075/1997</p>
  </div>
</template>

<style scoped>
.hig-temp {
  display: inline-block;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11.5px;
  font-weight: 700;
  background: color-mix(in srgb, var(--color-ember) 15%, transparent);
  color: var(--color-ember-soft);
  padding: 1px 6px;
  border-radius: 5px;
  border: 1px solid color-mix(in srgb, var(--color-ember) 35%, transparent);
}

/* La app es de tema oscuro, pero esta hoja se imprime para firmar en físico:
   se fuerza a fondo blanco / texto oscuro solo dentro de @media print. */
@media print {
  .print-hide {
    display: none !important;
  }
  .higiene-page {
    color: #1c1917 !important;
  }
  .higiene-page .hig-card {
    background: #fff !important;
    box-shadow: none !important;
    break-inside: avoid;
  }
  .higiene-page :deep(*) {
    color: #1c1917 !important;
    border-color: #e7e5e4 !important;
  }
}
</style>
