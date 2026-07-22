import type { Database } from '~/types/database.types'

export interface ManualSection {
  id: string
  titulo: string
  contenido: string
  orden: number
}

export const useManual = () => {
  const client = useSupabaseClient<Database>()

  const sections = useState<ManualSection[]>('manual-sections', () => [])
  const pending = useState('manual-pending', () => false)
  const error = useState<string | null>('manual-error', () => null)

  const load = async () => {
    pending.value = true
    error.value = null
    const { data, error: err } = await client.from('brand_manual_sections').select('*').order('orden')
    if (err) error.value = err.message
    else sections.value = data ?? []
    pending.value = false
    return true
  }

  const addSection = async () => {
    const { error: err } = await client
      .from('brand_manual_sections')
      .insert({ titulo: 'Nueva sección', contenido: '', orden: sections.value.length })
    if (err) throw err
    await load()
  }

  const updateSection = async (id: string, patch: { titulo?: string; contenido?: string }) => {
    const { error: err } = await client.from('brand_manual_sections').update(patch).eq('id', id)
    if (err) throw err
  }

  const removeSection = async (id: string) => {
    const { error: err } = await client.from('brand_manual_sections').delete().eq('id', id)
    if (err) throw err
    await load()
  }

  return { sections, pending, error, load, addSection, updateSection, removeSection }
}
