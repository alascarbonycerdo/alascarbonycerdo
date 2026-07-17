interface Coords {
  lat: number
  lng: number
}

export type FulfillmentMethod = 'pickup' | 'delivery'

export const useDelivery = () => {
  const method = useState<FulfillmentMethod | null>('delivery-method', () => null)
  const address = useState('delivery-address', () => '')
  const apartment = useState('delivery-apartment', () => '')
  const coords = useState<Coords | null>('delivery-coords', () => null)
  const locating = useState('delivery-locating', () => false)
  const locateError = useState<string | null>('delivery-locate-error', () => null)

  const hasAddress = computed(() => address.value.trim().length > 0)

  const isReady = computed(() => method.value === 'pickup' || (method.value === 'delivery' && hasAddress.value))

  const checkoutHint = computed(() => {
    if (!method.value) return 'Elige recoger o domicilio'
    if (method.value === 'delivery' && !hasAddress.value) return 'Agrega tu dirección'
    return ''
  })

  const mapsUrl = computed(() =>
    coords.value ? `https://www.google.com/maps?q=${coords.value.lat},${coords.value.lng}` : null,
  )

  const reverseGeocode = async (point: Coords) => {
    try {
      const result = await $fetch<{ display_name?: string }>('https://nominatim.openstreetmap.org/reverse', {
        query: { format: 'jsonv2', lat: point.lat, lon: point.lng },
      })
      if (result.display_name && !address.value.trim()) {
        address.value = result.display_name
      }
    } catch {
      // El autocompletado es un plus; si falla, el cliente escribe la dirección a mano.
    }
  }

  const setCoords = (point: Coords, { autofill = true }: { autofill?: boolean } = {}) => {
    coords.value = point
    if (autofill) reverseGeocode(point)
  }

  const locateMe = () => {
    if (!import.meta.client || !navigator.geolocation) {
      locateError.value = 'Tu navegador no permite compartir ubicación.'
      return
    }

    locating.value = true
    locateError.value = null

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
        locating.value = false
      },
      () => {
        locateError.value = 'No pudimos obtener tu ubicación. Puedes marcarla en el mapa o escribir la dirección.'
        locating.value = false
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const fulfillmentMessage = computed(() => {
    if (method.value === 'pickup') return '\n\nEntrega: recoger en el local.'

    if (method.value === 'delivery' && hasAddress.value) {
      const lines = [`- ${address.value.trim()}`]
      if (apartment.value.trim()) lines.push(`- ${apartment.value.trim()}`)
      if (mapsUrl.value) lines.push(`- Ubicación: ${mapsUrl.value}`)
      return `\n\nDirección de entrega:\n${lines.join('\n')}`
    }

    return ''
  })

  return {
    method,
    address,
    apartment,
    coords,
    locating,
    locateError,
    hasAddress,
    isReady,
    checkoutHint,
    mapsUrl,
    setCoords,
    locateMe,
    fulfillmentMessage,
  }
}
