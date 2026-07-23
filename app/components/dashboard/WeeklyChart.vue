<script setup lang="ts">
import { formatCOP } from '#shared/utils/format'

const { weeklySummary } = useDashboard()

const width = 320
const height = 180
const marginBottom = 24
const marginTop = 12
const plotHeight = height - marginBottom - marginTop

const hovered = ref<number | null>(null)

const niceMax = computed(() => {
  const max = Math.max(1, ...weeklySummary.value.map((d) => d.revenueThousands))
  const magnitude = 10 ** Math.floor(Math.log10(max))
  return Math.ceil(max / magnitude) * magnitude
})

const ticks = computed(() => [0, niceMax.value / 2, niceMax.value])

const slotWidth = computed(() => width / Math.max(1, weeklySummary.value.length))
const barWidth = computed(() => Math.min(24, slotWidth.value * 0.55))

const barX = (index: number) => index * slotWidth.value + (slotWidth.value - barWidth.value) / 2
const barY = (value: number) => marginTop + plotHeight - (value / niceMax.value) * plotHeight
const barHeight = (value: number) => (value / niceMax.value) * plotHeight

const peakIndex = computed(() => {
  let best = -1
  let bestValue = 0
  weeklySummary.value.forEach((d, i) => {
    if (d.revenueThousands > bestValue) {
      bestValue = d.revenueThousands
      best = i
    }
  })
  return bestValue > 0 ? best : -1
})

const tooltipDay = computed(() => (hovered.value !== null ? weeklySummary.value[hovered.value] : null))
</script>

<template>
  <section class="space-y-4">
    <h2 class="font-display text-2xl text-gold">Histórico semanal</h2>

    <div class="relative rounded-2xl bg-ink-soft/60 p-4 ring-1 ring-gold/10">
      <svg :viewBox="`0 0 ${width} ${height}`" class="w-full" role="img" aria-label="Ventas de los últimos 7 días">
        <line
          v-for="tick in ticks"
          :key="tick"
          :x1="0"
          :x2="width"
          :y1="barY(tick)"
          :y2="barY(tick)"
          stroke="currentColor"
          class="text-gold/10"
          stroke-width="1"
        />

        <g v-for="(day, index) in weeklySummary" :key="day.date">
          <rect
            :x="barX(index)"
            :y="barY(day.revenueThousands)"
            :width="barWidth"
            :height="Math.max(2, barHeight(day.revenueThousands))"
            rx="4"
            :fill="hovered === index ? 'var(--color-gold-soft)' : 'var(--color-gold)'"
            class="transition-colors"
          />

          <text
            v-if="index === peakIndex"
            :x="barX(index) + barWidth / 2"
            :y="barY(day.revenueThousands) - 6"
            text-anchor="middle"
            class="fill-gold text-[9px] font-semibold"
          >
            {{ formatCOP(day.revenueThousands) }}
          </text>

          <text
            :x="barX(index) + barWidth / 2"
            :y="height - 6"
            text-anchor="middle"
            class="fill-gold-soft/60 text-[9px]"
          >
            {{ day.label }}
          </text>

          <rect
            :x="index * slotWidth"
            :y="marginTop"
            :width="slotWidth"
            :height="plotHeight"
            fill="transparent"
            class="cursor-pointer outline-none"
            tabindex="0"
            :aria-label="`${day.label}: ${formatCOP(day.revenueThousands)}`"
            @pointerenter="hovered = index"
            @pointerleave="hovered = null"
            @focus="hovered = index"
            @blur="hovered = null"
          />
        </g>
      </svg>

      <div
        v-if="tooltipDay"
        class="pointer-events-none absolute top-2 left-2 rounded-lg bg-ink px-2.5 py-1.5 text-xs ring-1 ring-gold/20"
      >
        <p class="font-semibold text-gold">{{ formatCOP(tooltipDay.revenueThousands) }}</p>
        <p class="text-gold-soft/60">{{ tooltipDay.label }} · {{ tooltipDay.itemsSold }} ítems</p>
      </div>
    </div>

    <div class="overflow-x-auto rounded-2xl bg-ink-soft/40 ring-1 ring-gold/10">
      <table class="w-full min-w-[420px] text-left text-xs">
        <thead>
          <tr class="text-gold-soft/60">
            <th class="px-3 py-2 font-medium">Día</th>
            <th class="px-3 py-2 font-medium">Ventas</th>
            <th class="px-3 py-2 font-medium">Ítems</th>
            <th class="px-3 py-2 font-medium">Unidades usadas</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gold/10 tabular-nums">
          <tr v-for="day in weeklySummary" :key="day.date">
            <td class="px-3 py-2 text-gold-soft">{{ day.label }}</td>
            <td class="px-3 py-2 text-gold">{{ formatCOP(day.revenueThousands) }}</td>
            <td class="px-3 py-2 text-gold-soft">{{ day.itemsSold }}</td>
            <td class="px-3 py-2 text-gold-soft">{{ day.unitsConsumed.toLocaleString('es-CO') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
