<script setup lang="ts">
definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { isAdmin } = useProfile()
const { sections, pending, error, load, addSection, updateSection, removeSection } = useManual()

await useAsyncData('manual-init', () => load())

const drafts = reactive<Record<string, { titulo: string; contenido: string }>>({})

watch(
  sections,
  (list) => {
    for (const section of list) {
      if (!drafts[section.id]) drafts[section.id] = { titulo: section.titulo, contenido: section.contenido }
    }
  },
  { immediate: true },
)

const savingId = ref<string | null>(null)

const save = async (id: string) => {
  const draft = drafts[id]
  if (!draft) return
  savingId.value = id
  try {
    await updateSection(id, draft)
  } finally {
    savingId.value = null
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="font-display text-2xl text-gold">Manual de la marca</h2>
      <button
        v-if="isAdmin"
        type="button"
        class="text-xs font-semibold text-ember-soft hover:text-ember"
        @click="addSection"
      >
        + Agregar sección
      </button>
    </div>

    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>
    <p v-else-if="!pending && !sections.length" class="text-sm text-gold-soft/50">
      Todavía no hay secciones. {{ isAdmin ? 'Agrega la primera arriba.' : 'Pídele a un administrador que las agregue.' }}
    </p>

    <article
      v-for="section in sections"
      :key="section.id"
      class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
    >
      <template v-if="isAdmin">
        <input
          v-model="drafts[section.id]!.titulo"
          type="text"
          class="w-full rounded-lg bg-ink px-3 py-1.5 font-display text-lg text-gold ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
        <textarea
          v-model="drafts[section.id]!.contenido"
          rows="5"
          class="w-full resize-y rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        />
        <div class="flex items-center gap-3">
          <button
            type="button"
            :disabled="savingId === section.id"
            class="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
            @click="save(section.id)"
          >
            {{ savingId === section.id ? 'Guardando…' : 'Guardar' }}
          </button>
          <button
            type="button"
            class="text-xs font-semibold text-ember-soft hover:text-ember"
            @click="removeSection(section.id)"
          >
            Eliminar
          </button>
        </div>
      </template>
      <template v-else>
        <h3 class="font-display text-lg text-gold">{{ section.titulo }}</h3>
        <p class="whitespace-pre-wrap text-sm text-gold-soft/80">{{ section.contenido }}</p>
      </template>
    </article>
  </div>
</template>
