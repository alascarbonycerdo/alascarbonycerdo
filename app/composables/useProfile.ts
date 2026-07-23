import type { Database } from '~/types/database.types'

interface Profile {
  role: string
  nombre: string | null
  avatar_url: string | null
  punto_venta_id: string | null
  puntos_venta: { nombre: string } | null
}

export const useProfile = () => {
  const user = useSupabaseUser()
  const client = useSupabaseClient<Database>()

  const profile = useState<Profile | null>('staff-profile', () => null)
  const loading = useState('staff-profile-loading', () => false)

  const fetchProfile = async () => {
    if (!user.value) {
      profile.value = null
      return
    }
    loading.value = true
    const { data, error } = await client
      .from('profiles')
      .select('role, nombre, avatar_url, punto_venta_id, puntos_venta(nombre)')
      .eq('id', user.value.sub)
      .single()
    if (error) console.error('[useProfile] No se pudo cargar el perfil:', error.message)
    profile.value = data
    loading.value = false
  }

  const updateNombre = async (nombre: string) => {
    if (!user.value) return
    const { error } = await client.from('profiles').update({ nombre }).eq('id', user.value.sub)
    if (error) throw error
    await fetchProfile()
  }

  const uploadAvatar = async (file: File) => {
    if (!user.value) return
    const extension = file.name.split('.').pop() ?? 'jpg'
    const path = `${user.value.sub}/avatar.${extension}`

    const { error: uploadError } = await client.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: publicUrlData } = client.storage.from('avatars').getPublicUrl(path)
    // Evita que el navegador siga mostrando la imagen vieja en caché tras reemplazarla.
    const bustedUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`

    const { error: updateError } = await client.from('profiles').update({ avatar_url: bustedUrl }).eq('id', user.value.sub)
    if (updateError) throw updateError
    await fetchProfile()
  }

  const role = computed(() => profile.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'administrador')
  const isStaff = computed(() => role.value === 'vendedor' || role.value === 'administrador')
  const puntoVentaNombre = computed(() => profile.value?.puntos_venta?.nombre ?? null)

  return { profile, role, isAdmin, isStaff, puntoVentaNombre, loading, fetchProfile, updateNombre, uploadAvatar }
}
