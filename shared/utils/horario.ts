export function formatDia(iso: string): string {
  const [year = 1970, month = 1, day = 1] = iso.split('-').map(Number)
  const asUtc = new Date(Date.UTC(year, month - 1, day))
  return new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(asUtc)
}

export function formatHora(time: string): string {
  return time.slice(0, 5)
}

export function horasEntreHoras(entrada: string, salida: string): number {
  const [eh = 0, em = 0] = entrada.split(':').map(Number)
  const [sh = 0, sm = 0] = salida.split(':').map(Number)
  let horas = sh + sm / 60 - (eh + em / 60)
  if (horas < 0) horas += 24
  return horas
}
