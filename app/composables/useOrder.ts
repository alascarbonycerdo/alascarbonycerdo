import { contact, porkItems, wingsCombos, type MenuItem } from '#shared/utils/menu'
import { formatCOP } from '#shared/utils/format'

const allItems: MenuItem[] = [...wingsCombos, ...porkItems]

export const useOrder = () => {
  const quantities = useState<Record<string, number>>('order-quantities', () => ({}))

  const qty = (id: string) => quantities.value[id] ?? 0

  const setQty = (id: string, value: number) => {
    quantities.value = { ...quantities.value, [id]: Math.max(0, value) }
  }

  const increment = (id: string) => setQty(id, qty(id) + 1)
  const decrement = (id: string) => setQty(id, qty(id) - 1)

  const lines = computed(() =>
    allItems.map((item) => ({ item, qty: qty(item.id) })).filter((line) => line.qty > 0),
  )

  const totalItems = computed(() => lines.value.reduce((sum, line) => sum + line.qty, 0))

  const totalThousands = computed(() =>
    lines.value.reduce((sum, line) => sum + line.qty * line.item.priceThousands, 0),
  )

  const formattedTotal = computed(() => formatCOP(totalThousands.value))

  const whatsappUrl = computed(() => {
    if (!lines.value.length) {
      return `https://wa.me/${contact.whatsapp}`
    }

    const body = lines.value
      .map((line) => {
        const detail = line.item.detail ? ` (${line.item.detail})` : ''
        const subtotal = (line.qty * line.item.priceThousands * 1000).toLocaleString('es-CO')
        return `- ${line.qty} x ${line.item.name}${detail} — $${subtotal}`
      })
      .join('\n')

    const { addressMessage } = useDelivery()
    const message = `Hola! Quiero pedir:\n${body}\n\nTotal: ${formattedTotal.value}${addressMessage.value}`
    return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(message)}`
  })

  return {
    qty,
    increment,
    decrement,
    lines,
    totalItems,
    totalThousands,
    formattedTotal,
    whatsappUrl,
  }
}
