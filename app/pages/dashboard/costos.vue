<script setup lang="ts">
definePageMeta({ middleware: ['staff', 'admin'], layout: 'dashboard' })

const { state, load, save, saving, savedAt, addInsumo, removeInsumo } = useCosting()

await useAsyncData('costing-init', () => load())

const savedLabel = computed(() => {
  if (!savedAt.value) return ''
  return new Date(savedAt.value).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
})

const addEmpaque = () => {
  const id = import.meta.client ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  state.value.empaques.items.push({ id, nombre: 'Nuevo item', cantidad: 0, valorTienda: 0 })
}

const removeEmpaque = (id: string) => {
  const index = state.value.empaques.items.findIndex((item) => item.id === id)
  if (index !== -1) state.value.empaques.items.splice(index, 1)
}
</script>

<template>
  <div>
    <div class="flex items-center gap-3">
      <button
        type="button"
        class="flex items-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
        :disabled="saving"
        @click="save"
      >
        <Icon name="lucide:save" class="size-4" />
        {{ saving ? 'Guardando…' : 'Guardar cambios' }}
      </button>
      <p v-if="savedLabel" class="text-xs text-gold-soft/60">Guardado a las {{ savedLabel }}</p>
    </div>

    <div class="mt-10 space-y-12">
      <InsumoTable
        title="Proteínas"
        cantidad-label="Cantidad (g)"
        porcion-label="Porción (g)"
        :insumos="state.proteinas"
        @add="addInsumo(state.proteinas)"
        @remove="(id) => removeInsumo(state.proteinas, id)"
      />

      <InsumoTable
        title="Acompañantes"
        cantidad-label="Cantidad"
        porcion-label="Porción"
        :insumos="state.acompanantes"
        @add="addInsumo(state.acompanantes)"
        @remove="(id) => removeInsumo(state.acompanantes, id)"
      />

      <SalsasSection :salsas="state.salsas" />

      <MarinadaSection :marinada="state.marinada" :proteinas="state.proteinas" />

      <EmpaqueTable :items="state.empaques.items" @add="addEmpaque" @remove="removeEmpaque" />

      <div class="space-y-2 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10">
        <label class="flex w-48 flex-col gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
          Consumibles básico por porción (valor manual)
          <input
            v-model.number="state.empaques.consumiblesBasico"
            type="number"
            class="rounded-lg bg-ink px-2 py-1 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
          >
        </label>
      </div>

      <CarbonSection :carbon="state.carbon" />

      <LaborSection :labor="state.labor" />

      <ProductCostTable />
    </div>
  </div>
</template>
