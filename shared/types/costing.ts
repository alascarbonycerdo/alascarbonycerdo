export interface RecipeInsumo {
  id: string
  nombre: string
  /** Cantidad comprada (gramos o unidades). */
  cantidad: number
  /** Precio pagado por esa cantidad. */
  valorTienda: number
  /** Gramos o unidades usadas por porción/receta. */
  porcion: number
}

export interface EmpaqueItem {
  id: string
  nombre: string
  cantidad: number
  valorTienda: number
}

export interface CarbonItem {
  id: string
  tipo: string
  pesoKilo: number
  valorTienda: number
}

export interface SalsaBatch {
  id: string
  nombre: string
  /** Si tiene ingredientes, el coste se calcula sumándolos; si no, se usa costeManual. */
  ingredientes: RecipeInsumo[]
  costeManual: number
  /** Gramos que rinde el lote. */
  cantidadRendimiento: number
  /** Gramos servidos por porción envasada. */
  porcionGramos: number
}

export interface SalsaConfig {
  batches: SalsaBatch[]
  /** Costo de una salsera llena (editable — no se deriva limpio de los lotes). */
  salseraLlena: number
}

export interface MarinadaConfig {
  ingredientes: RecipeInsumo[]
  rendimientoGramos: number
  /** Costo de marinada asignado por tipo de proteína (id de proteína -> valor). */
  costoPorProteina: Record<string, number>
}

export interface EmpaqueConsumibleConfig {
  items: EmpaqueItem[]
  consumiblesBasico: number
}

export interface CarbonConfig {
  items: CarbonItem[]
  platosPorKilo: number
}

export interface LaborConfig {
  personal: string
  valorDia: number
  horas: number
  platosXJornada: number
  valorPorPlatoManual: number
}

export interface ProductoReceta {
  id: string
  nombre: string
  proteinaId: string
  qtyProteina: number
  qtyAcompanantes: number
  qtySalsas: number
  qtyEmpaque: number
  valorEmpaqueUnitario: number
  qtyConsumibles: number
  carbonId: string
}

export interface CostingState {
  proteinas: RecipeInsumo[]
  acompanantes: RecipeInsumo[]
  salsas: SalsaConfig
  marinada: MarinadaConfig
  empaques: EmpaqueConsumibleConfig
  carbon: CarbonConfig
  labor: LaborConfig
  productos: ProductoReceta[]
}

export interface ProductoCostoDesglose {
  valProteina: number
  valSalsas: number
  valAcompanantes: number
  valEmpaque: number
  valConsumibles: number
  valMarinada: number
  valCarbon: number
  costoProducto: number
  costoPorUnidad: number
}
