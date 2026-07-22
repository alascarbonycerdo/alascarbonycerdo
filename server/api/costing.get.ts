import type { CostingState } from '#shared/types/costing'
import { defaultCostingState } from '#shared/utils/costingDefaults'

export default defineEventHandler(async () => {
  const existing = await useStorage('dashboard').getItem<CostingState>('costing.json')
  if (existing) return existing

  const seeded = defaultCostingState()
  await useStorage('dashboard').setItem('costing.json', seeded)
  return seeded
})
