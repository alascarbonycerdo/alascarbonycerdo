<script setup lang="ts">
import type { DivIcon, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'

const DEFAULT_CENTER = { lat: 4.710989, lng: -74.072092 }

const delivery = useDelivery()

const mapContainer = ref<HTMLDivElement | null>(null)
let map: LeafletMap | null = null
let marker: LeafletMarker | null = null
let pinIcon: DivIcon | null = null

function buildPinIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    className: '',
    html: `<svg width="30" height="40" viewBox="0 0 30 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M15 0C6.716 0 0 6.716 0 15c0 10.5 15 25 15 25s15-14.5 15-25C30 6.716 23.284 0 15 0z" fill="#dc2624" stroke="#f4c430" stroke-width="1.5"/>
      <circle cx="15" cy="15" r="5.5" fill="#171210"/>
    </svg>`,
    iconSize: [30, 40],
    iconAnchor: [15, 40],
  })
}

onMounted(async () => {
  const L = await import('leaflet')
  await import('leaflet/dist/leaflet.css')

  if (!mapContainer.value) return

  pinIcon = buildPinIcon(L)
  const start = delivery.coords.value ?? DEFAULT_CENTER

  map = L.map(mapContainer.value).setView([start.lat, start.lng], delivery.coords.value ? 16 : 12)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(map)

  const placeMarker = (lat: number, lng: number) => {
    if (!map) return
    if (marker) {
      marker.setLatLng([lat, lng])
      return
    }
    marker = L.marker([lat, lng], { icon: pinIcon!, draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker!.getLatLng()
      delivery.setCoords({ lat: pos.lat, lng: pos.lng })
    })
  }

  if (delivery.coords.value) placeMarker(delivery.coords.value.lat, delivery.coords.value.lng)

  map.on('click', (event) => {
    delivery.setCoords({ lat: event.latlng.lat, lng: event.latlng.lng })
  })

  watch(delivery.coords, (point) => {
    if (!point || !map) return
    placeMarker(point.lat, point.lng)
    map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15))
  })
})

watch(
  () => delivery.method.value,
  async (method) => {
    if (method !== 'delivery') return
    await nextTick()
    map?.invalidateSize()
  },
)

onBeforeUnmount(() => {
  map?.remove()
  map = null
  marker = null
})
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center gap-3">
      <span class="h-px flex-1 bg-ember/50" />
      <h2 class="font-display text-3xl text-gold">Entrega</h2>
      <span class="h-px flex-1 bg-ember/50" />
    </div>

    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl px-4 py-3 font-display text-sm tracking-wide ring-1 transition"
        :class="
          delivery.method.value === 'pickup'
            ? 'bg-gold text-ink ring-gold'
            : 'bg-ink-soft text-gold-soft ring-gold/15 hover:ring-gold/30'
        "
        @click="delivery.method.value = 'pickup'"
      >
        <Icon name="lucide:store" class="size-5" />
        Recoger
      </button>
      <button
        type="button"
        class="flex flex-col items-center gap-1 rounded-xl px-4 py-3 font-display text-sm tracking-wide ring-1 transition"
        :class="
          delivery.method.value === 'delivery'
            ? 'bg-gold text-ink ring-gold'
            : 'bg-ink-soft text-gold-soft ring-gold/15 hover:ring-gold/30'
        "
        @click="delivery.method.value = 'delivery'"
      >
        <Icon name="lucide:bike" class="size-5" />
        A domicilio
      </button>
    </div>

    <p
      v-if="delivery.method.value === 'pickup'"
      class="rounded-xl bg-ink-soft/60 px-4 py-3 text-sm text-gold-soft/80 ring-1 ring-gold/10"
    >
      Perfecto — pasas a recogerlo al local. Te confirmamos la dirección y el tiempo por WhatsApp.
    </p>

    <div v-show="delivery.method.value === 'delivery'" class="space-y-3">
      <button
        type="button"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-ink-soft py-2.5 text-sm font-semibold text-gold ring-1 ring-gold/20 transition hover:bg-ink-soft/70 disabled:opacity-60"
        :disabled="delivery.locating.value"
        @click="delivery.locateMe()"
      >
        <Icon name="lucide:locate-fixed" class="size-4" />
        {{ delivery.locating.value ? 'Buscando tu ubicación…' : 'Usar mi ubicación' }}
      </button>

      <p v-if="delivery.locateError.value" class="text-xs text-ember-soft">
        {{ delivery.locateError.value }}
      </p>

      <div ref="mapContainer" class="h-56 w-full overflow-hidden rounded-2xl ring-1 ring-gold/15" />
      <p class="text-xs text-gold-soft/60">
        Toca el mapa o arrastra el pin para ajustar el punto exacto de entrega.
      </p>

      <div class="space-y-1">
        <label class="flex items-center gap-1 text-xs uppercase tracking-widest text-gold-soft/70">
          Dirección
          <span class="text-ember">*</span>
        </label>
        <textarea
          v-model="delivery.address.value"
          rows="2"
          required
          placeholder="Calle, número, barrio"
          class="w-full resize-none rounded-xl bg-ink-soft px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        />
      </div>

      <div class="space-y-1">
        <label class="text-xs uppercase tracking-widest text-gold-soft/70">
          Apartamento o indicación (opcional)
        </label>
        <input
          v-model="delivery.apartment.value"
          type="text"
          placeholder="Torre 2, apto 402, portería azul…"
          class="w-full rounded-xl bg-ink-soft px-3 py-2 text-sm text-gold-soft ring-1 ring-gold/20 focus:outline-none focus:ring-gold/50"
        >
      </div>
    </div>
  </section>
</template>
