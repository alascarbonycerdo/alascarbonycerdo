import type { CostingState } from '#shared/types/costing'

export function defaultCostingState(): CostingState {
  return {
    proteinas: [
      { id: 'pollo', nombre: 'Pollo', cantidad: 1000, valorTienda: 7500, porcion: 135 },
      { id: 'chicharron', nombre: 'Chicharrón', cantidad: 500, valorTienda: 4600, porcion: 300 },
      { id: 'costilla', nombre: 'Costilla', cantidad: 500, valorTienda: 8000, porcion: 500 },
    ],

    acompanantes: [
      { id: 'papas', nombre: 'Papas', cantidad: 5000, valorTienda: 8000, porcion: 170 },
      { id: 'arepas', nombre: 'Arepas', cantidad: 50, valorTienda: 5000, porcion: 2 },
    ],

    salsas: {
      batches: [
        {
          id: 'chimichurri',
          nombre: 'Chimichurri',
          cantidadRendimiento: 1700,
          porcionGramos: 14,
          costeManual: 0,
          ingredientes: [
            { id: 'aceite', nombre: 'Aceite', cantidad: 1000, valorTienda: 7000, porcion: 400 },
            { id: 'vinagre', nombre: 'Vinagre', cantidad: 3000, valorTienda: 7000, porcion: 400 },
            { id: 'perejil', nombre: 'Perejil', cantidad: 1000, valorTienda: 7000, porcion: 500 },
            { id: 'cilantro', nombre: 'Cilantro', cantidad: 1000, valorTienda: 5000, porcion: 500 },
            { id: 'ajo-chim', nombre: 'Ajo', cantidad: 200, valorTienda: 2000, porcion: 50 },
            { id: 'pimienta-chim', nombre: 'Pimienta', cantidad: 125, valorTienda: 3000, porcion: 30 },
            { id: 'sal-chim', nombre: 'Sal', cantidad: 500, valorTienda: 3000, porcion: 40 },
            { id: 'oregano', nombre: 'Orégano', cantidad: 125, valorTienda: 3000, porcion: 20 },
          ],
        },
        {
          id: 'ajo',
          nombre: 'Ajo',
          cantidadRendimiento: 1500,
          porcionGramos: 14,
          costeManual: 15000,
          ingredientes: [],
        },
        {
          id: 'bbq',
          nombre: 'BBQ',
          cantidadRendimiento: 500,
          porcionGramos: 14,
          costeManual: 7000,
          ingredientes: [],
        },
      ],
      salseraLlena: 1074.266667,
    },

    marinada: {
      rendimientoGramos: 2000,
      ingredientes: [
        { id: 'soya', nombre: 'Soya', cantidad: 1000, valorTienda: 10000, porcion: 100 },
        { id: 'cerveza', nombre: 'Cerveza', cantidad: 1000, valorTienda: 8000, porcion: 200 },
        { id: 'pimienta-mar', nombre: 'Pimienta', cantidad: 125, valorTienda: 6000, porcion: 14 },
        { id: 'comino', nombre: 'Comino', cantidad: 125, valorTienda: 7000, porcion: 14 },
        { id: 'sal-mar', nombre: 'Sal', cantidad: 500, valorTienda: 3000, porcion: 14 },
      ],
      costoPorProteina: {
        pollo: 172.5,
        costilla: 591.4285714,
        chicharron: 336,
      },
    },

    empaques: {
      items: [
        { id: 'caja-grande', nombre: 'Caja Grande', cantidad: 1, valorTienda: 900 },
        { id: 'caja-pequena', nombre: 'Caja Pequeña', cantidad: 1, valorTienda: 600 },
        { id: 'servilletas', nombre: 'Servilletas', cantidad: 200, valorTienda: 4500 },
        { id: 'salseras', nombre: 'Salseras', cantidad: 50, valorTienda: 3500 },
        { id: 'bolsas', nombre: 'Bolsas Blancas', cantidad: 100, valorTienda: 4000 },
        { id: 'guantes', nombre: 'Guantes Nitrilo', cantidad: 100, valorTienda: 17000 },
        { id: 'tenedores', nombre: 'Tenedores', cantidad: 100, valorTienda: 5000 },
      ],
      consumiblesBasico: 197.5,
    },

    carbon: {
      items: [
        { id: 'carbon-a', tipo: 'Carbón A', pesoKilo: 5, valorTienda: 33500 },
        { id: 'carbon-amarillo', tipo: 'Carbón Amarillo', pesoKilo: 2, valorTienda: 14000 },
        { id: 'carbon-blanco-rojo', tipo: 'Carbón Blanco/Rojo', pesoKilo: 2.5, valorTienda: 12000 },
        { id: 'carbon-sin-marca', tipo: 'Carbón sin Marca', pesoKilo: 3, valorTienda: 13000 },
        { id: 'lenos-briquetas', tipo: 'Leños Briquetas Cáscara de Coco', pesoKilo: 6, valorTienda: 27000 },
        { id: 'bulto-15', tipo: 'Bulto 15Kg', pesoKilo: 15, valorTienda: 50000 },
        { id: 'bulto-20', tipo: 'Bulto 20Kg', pesoKilo: 20, valorTienda: 50000 },
      ],
      platosPorKilo: 5,
    },

    labor: {
      personal: 'Parrillero',
      valorDia: 50000,
      horas: 8,
      platosXJornada: 8,
      valorPorPlatoManual: 16000,
    },

    productos: [
      {
        id: 'wings-3',
        nombre: '3 Alas',
        proteinaId: 'pollo',
        qtyProteina: 3,
        qtyAcompanantes: 1,
        qtySalsas: 1,
        qtyEmpaque: 1,
        valorEmpaqueUnitario: 600,
        qtyConsumibles: 1,
        carbonId: 'bulto-20',
      },
      {
        id: 'wings-6',
        nombre: '6 Alas',
        proteinaId: 'pollo',
        qtyProteina: 6,
        qtyAcompanantes: 2,
        qtySalsas: 2,
        qtyEmpaque: 1,
        valorEmpaqueUnitario: 750,
        qtyConsumibles: 2,
        carbonId: 'bulto-20',
      },
      {
        id: 'wings-12',
        nombre: '12 Alas',
        proteinaId: 'pollo',
        qtyProteina: 12,
        qtyAcompanantes: 4,
        qtySalsas: 3,
        qtyEmpaque: 1,
        valorEmpaqueUnitario: 750,
        qtyConsumibles: 4,
        carbonId: 'bulto-20',
      },
      {
        id: 'chicharron',
        nombre: 'Chicharrón',
        proteinaId: 'chicharron',
        qtyProteina: 1,
        qtyAcompanantes: 1,
        qtySalsas: 1,
        qtyEmpaque: 1,
        valorEmpaqueUnitario: 600,
        qtyConsumibles: 1,
        carbonId: 'bulto-20',
      },
      {
        id: 'costilla',
        nombre: 'Costilla',
        proteinaId: 'costilla',
        qtyProteina: 1,
        qtyAcompanantes: 2,
        qtySalsas: 2,
        qtyEmpaque: 1,
        valorEmpaqueUnitario: 750,
        qtyConsumibles: 2,
        carbonId: 'bulto-20',
      },
    ],
  }
}
