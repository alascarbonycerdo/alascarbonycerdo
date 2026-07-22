import type {
  CarbonItem,
  CostingState,
  EmpaqueItem,
  ProductoCostoDesglose,
  ProductoReceta,
  RecipeInsumo,
  SalsaBatch,
} from '#shared/types/costing'

export function valorPorcion(insumo: RecipeInsumo): number {
  if (!insumo.cantidad) return 0
  return (insumo.valorTienda / insumo.cantidad) * insumo.porcion
}

export function sumaValorPorcion(insumos: RecipeInsumo[]): number {
  return insumos.reduce((sum, insumo) => sum + valorPorcion(insumo), 0)
}

export function empaqueValorUnd(item: EmpaqueItem): number {
  if (!item.cantidad) return 0
  return item.valorTienda / item.cantidad
}

export function salsaCoste(batch: SalsaBatch): number {
  if (batch.ingredientes.length) return sumaValorPorcion(batch.ingredientes)
  return batch.costeManual
}

export function salsaValorEnvasada(batch: SalsaBatch): number {
  if (!batch.cantidadRendimiento) return 0
  return (salsaCoste(batch) / batch.cantidadRendimiento) * batch.porcionGramos
}

export function carbonValorPorKilo(item: CarbonItem): number {
  if (!item.pesoKilo) return 0
  return item.valorTienda / item.pesoKilo
}

export function carbonValorPorPlato(item: CarbonItem, platosPorKilo: number): number {
  if (!platosPorKilo) return 0
  return carbonValorPorKilo(item) / platosPorKilo
}

export function calcularCostoProducto(producto: ProductoReceta, state: CostingState): ProductoCostoDesglose {
  const proteina = state.proteinas.find((p) => p.id === producto.proteinaId)
  const valProteina = proteina ? producto.qtyProteina * valorPorcion(proteina) : 0

  const valSalsas = producto.qtySalsas * state.salsas.salseraLlena

  const comboAcompanantes = sumaValorPorcion(state.acompanantes)
  const valAcompanantes = producto.qtyAcompanantes * comboAcompanantes

  const valEmpaque = producto.qtyEmpaque * producto.valorEmpaqueUnitario

  const valConsumibles = producto.qtyConsumibles * state.empaques.consumiblesBasico

  const marinadaUnit = state.marinada.costoPorProteina[producto.proteinaId] ?? 0
  const valMarinada = producto.qtyProteina * marinadaUnit

  const carbonItem = state.carbon.items.find((c) => c.id === producto.carbonId)
  const valCarbon = carbonItem ? carbonValorPorPlato(carbonItem, state.carbon.platosPorKilo) : 0

  const costoProducto = valProteina + valSalsas + valAcompanantes + valEmpaque + valConsumibles + valMarinada + valCarbon
  const costoPorUnidad = producto.qtyProteina ? costoProducto / producto.qtyProteina : costoProducto

  return {
    valProteina,
    valSalsas,
    valAcompanantes,
    valEmpaque,
    valConsumibles,
    valMarinada,
    valCarbon,
    costoProducto,
    costoPorUnidad,
  }
}
