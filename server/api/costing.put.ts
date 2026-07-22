import type { CostingState } from '#shared/types/costing'

export default defineEventHandler(async (event) => {
  const body = await readBody<CostingState>(event)
  await useStorage('dashboard').setItem('costing.json', body)
  return body
})
