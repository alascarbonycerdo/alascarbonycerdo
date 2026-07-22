<script setup lang="ts">
definePageMeta({ middleware: ['staff'], layout: 'dashboard' })

const { isAdmin } = useProfile()
const { dishes, pending, error, load, updateSteps, uploadPhoto } = useEmplatado()

await useAsyncData('emplatado-init', () => load())

const drafts = reactive<Record<string, string>>({})

watch(
  dishes,
  (list) => {
    for (const dish of list) {
      if (drafts[dish.id] === undefined) drafts[dish.id] = dish.pasos
    }
  },
  { immediate: true },
)

const savingId = ref<string | null>(null)
const save = async (id: string) => {
  savingId.value = id
  try {
    await updateSteps(id, drafts[id] ?? '')
  } finally {
    savingId.value = null
  }
}

const uploadingId = ref<string | null>(null)
const fileInputs = ref<Record<string, HTMLInputElement | null>>({})

const onFileChange = async (id: string, event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploadingId.value = id
  try {
    await uploadPhoto(id, file)
  } finally {
    uploadingId.value = null
    const input = fileInputs.value[id]
    if (input) input.value = ''
  }
}
</script>

<template>
  <div class="space-y-6">
    <h2 class="font-display text-2xl text-gold">Guía de emplatado</h2>
    <p class="text-xs text-gold-soft/60">Paso a paso por plato para que siempre se vea igual.</p>

    <p v-if="error" class="rounded-xl bg-ember/10 px-4 py-3 text-sm text-ember-soft">{{ error }}</p>

    <article
      v-for="dish in dishes"
      :key="dish.id"
      class="space-y-3 rounded-2xl bg-ink-soft/40 p-4 ring-1 ring-gold/10"
      :class="{ 'opacity-60': pending }"
    >
      <div class="flex items-center gap-3">
        <div class="size-20 shrink-0 overflow-hidden rounded-xl bg-ink ring-1 ring-gold/15">
          <img v-if="dish.fotoUrl" :src="dish.fotoUrl" alt="" class="size-full object-cover">
          <div v-else class="flex size-full items-center justify-center">
            <Icon name="lucide:utensils-crossed" class="size-6 text-gold-soft/30" />
          </div>
        </div>
        <div>
          <p class="font-display text-lg text-gold">{{ dish.nombre }}</p>
          <template v-if="isAdmin">
            <button
              type="button"
              class="text-xs font-semibold text-ember-soft hover:text-ember"
              :disabled="uploadingId === dish.id"
              @click="fileInputs[dish.id]?.click()"
            >
              {{ uploadingId === dish.id ? 'Subiendo…' : dish.fotoUrl ? 'Cambiar foto' : 'Subir foto' }}
            </button>
            <input
              :ref="(el) => (fileInputs[dish.id] = el as HTMLInputElement)"
              type="file"
              accept="image/*"
              class="hidden"
              @change="onFileChange(dish.id, $event)"
            >
          </template>
        </div>
      </div>

      <template v-if="isAdmin">
        <textarea
          v-model="drafts[dish.id]"
          rows="4"
          placeholder="Ej: 1. Base de papas al centro. 2. Proteína encima, inclinada 45°. 3. Salsa en línea diagonal…"
          class="w-full resize-y rounded-lg bg-ink px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        />
        <button
          type="button"
          :disabled="savingId === dish.id"
          class="rounded-lg bg-gold px-3 py-1.5 text-xs font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-60"
          @click="save(dish.id)"
        >
          {{ savingId === dish.id ? 'Guardando…' : 'Guardar pasos' }}
        </button>
      </template>
      <p v-else-if="dish.pasos" class="whitespace-pre-wrap text-sm text-gold-soft/80">{{ dish.pasos }}</p>
      <p v-else class="text-sm text-gold-soft/50">Todavía no hay pasos para este plato.</p>
    </article>
  </div>
</template>
