import type { CostingState, ProductoReceta, RecipeInsumo } from '#shared/types/costing'
import { defaultCostingState } from '#shared/utils/costingDefaults'
import { calcularCostoProducto } from '#shared/utils/costingCalc'

export const useCosting = () => {
  const state = useState<CostingState>('costing-state', defaultCostingState)
  const pending = useState('costing-pending', () => false)
  const saving = useState('costing-saving', () => false)
  const savedAt = useState<number | null>('costing-saved-at', () => null)

  const load = async () => {
    pending.value = true
    try {
      state.value = await $fetch<CostingState>('/api/costing')
    } finally {
      pending.value = false
    }
  }

  const save = async () => {
    saving.value = true
    try {
      await $fetch('/api/costing', { method: 'PUT', body: state.value })
      savedAt.value = Date.now()
    } finally {
      saving.value = false
    }
  }

  const newId = () => (import.meta.client ? crypto.randomUUID() : Math.random().toString(36).slice(2))

  const addInsumo = (list: RecipeInsumo[]) => {
    list.push({ id: newId(), nombre: 'Nuevo insumo', cantidad: 0, valorTienda: 0, porcion: 0 })
  }

  const removeInsumo = (list: RecipeInsumo[], id: string) => {
    const index = list.findIndex((item) => item.id === id)
    if (index !== -1) list.splice(index, 1)
  }

  const addProducto = () => {
    const primeraProteina = state.value.proteinas[0]?.id ?? ''
    const primerCarbon = state.value.carbon.items[0]?.id ?? ''
    const producto: ProductoReceta = {
      id: newId(),
      nombre: 'Nuevo producto',
      proteinaId: primeraProteina,
      qtyProteina: 1,
      qtyAcompanantes: 1,
      qtySalsas: 1,
      qtyEmpaque: 1,
      valorEmpaqueUnitario: 0,
      qtyConsumibles: 1,
      carbonId: primerCarbon,
    }
    state.value.productos.push(producto)
  }

  const removeProducto = (id: string) => {
    const index = state.value.productos.findIndex((p) => p.id === id)
    if (index !== -1) state.value.productos.splice(index, 1)
  }

  const desgloses = computed(() =>
    Object.fromEntries(state.value.productos.map((p) => [p.id, calcularCostoProducto(p, state.value)])),
  )

  return {
    state,
    pending,
    saving,
    savedAt,
    load,
    save,
    addInsumo,
    removeInsumo,
    addProducto,
    removeProducto,
    desgloses,
  }
}
