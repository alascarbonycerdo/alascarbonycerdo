import type { Database } from '~/types/database.types'

export interface EmplatadoDish {
  id: string
  nombre: string
  pasos: string
  fotoUrl: string | null
  orden: number
}

export const useEmplatado = () => {
  const client = useSupabaseClient<Database>()

  const dishes = useState<EmplatadoDish[]>('emplatado-dishes', () => [])
  const pending = useState('emplatado-pending', () => false)
  const error = useState<string | null>('emplatado-error', () => null)

  const load = async () => {
    pending.value = true
    error.value = null
    const { data, error: err } = await client.from('guia_emplatado').select('*').order('orden')
    if (err) {
      error.value = err.message
    } else {
      dishes.value = (data ?? []).map((row) => ({
        id: row.id,
        nombre: row.nombre,
        pasos: row.pasos,
        fotoUrl: row.foto_url,
        orden: row.orden,
      }))
    }
    pending.value = false
    return true
  }

  const updateSteps = async (id: string, pasos: string) => {
    const { error: err } = await client.from('guia_emplatado').update({ pasos }).eq('id', id)
    if (err) throw err
  }

  const uploadPhoto = async (id: string, file: File) => {
    const extension = file.name.split('.').pop() ?? 'jpg'
    const path = `${id}/${Date.now()}.${extension}`

    const { error: uploadError } = await client.storage.from('emplatado').upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: publicUrlData } = client.storage.from('emplatado').getPublicUrl(path)

    const { error: updateError } = await client.from('guia_emplatado').update({ foto_url: publicUrlData.publicUrl }).eq('id', id)
    if (updateError) throw updateError
    await load()
  }

  return { dishes, pending, error, load, updateSteps, uploadPhoto }
}
