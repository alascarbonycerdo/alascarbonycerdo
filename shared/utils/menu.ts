export interface MenuItem {
  id: string
  name: string
  detail?: string
  priceThousands: number
}

export const wingsCombos: MenuItem[] = [
  { id: 'wings-3', name: '3 Alas', priceThousands: 14 },
  { id: 'wings-6', name: '6 Alas', priceThousands: 24 },
  { id: 'wings-12', name: '12 Alas', priceThousands: 40 },
]

export const porkItems: MenuItem[] = [
  { id: 'chorizo', name: 'Chorizo', detail: 'Artesanal', priceThousands: 13 },
  { id: 'chicharron', name: 'Chicharrón', detail: '300 gramos', priceThousands: 16 },
  { id: 'ceviche', name: 'Ceviche de Chicharrón', priceThousands: 25 },
  { id: 'costilla', name: 'Costilla', detail: '500 gramos', priceThousands: 28 },
]

export const contact = {
  whatsapp: '573052202396',
  whatsappDisplay: '305 220 2396',
  instagram: 'alascarbonycerdo',
  facebook: 'alascarbonycerdo',
  facebookURL: 'profile.php?id=61590691526649',
}
