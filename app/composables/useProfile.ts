import type { Database } from '~/types/database.types'

export interface Profile {
  role: string
  nombre: string | null
  avatar_url: string | null
  punto_venta_id: string | null
  puntos_venta: { nombre: string } | null
  activo: boolean
  celular: string | null
  documento: string | null
  tipo_sangre: string | null
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
      .select('role, nombre, avatar_url, punto_venta_id, puntos_venta(nombre), activo, celular, documento, tipo_sangre')
      .eq('id', user.value.sub)
      .single()
    if (error) console.error('[useProfile] No se pudo cargar el perfil:', error.message)
    profile.value = data
    loading.value = false
  }

  // Cualquier usuario puede autoeditar su propia fila salvo role/activo/
  // punto_venta_id/tarifa_hora (bloqueados por el trigger prevent_unauthorized_role_change);
  // el resto de campos personales pasan por aquí.
  const updateProfile = async (patch: { nombre?: string; celular?: string; documento?: string; tipoSangre?: string }) => {
    if (!user.value) return
    const update: { nombre?: string; celular?: string; documento?: string; tipo_sangre?: string } = {}
    if (patch.nombre !== undefined) update.nombre = patch.nombre
    if (patch.celular !== undefined) update.celular = patch.celular
    if (patch.documento !== undefined) update.documento = patch.documento
    if (patch.tipoSangre !== undefined) update.tipo_sangre = patch.tipoSangre

    const { error } = await client.from('profiles').update(update).eq('id', user.value.sub)
    if (error) throw error
    await fetchProfile()
  }

  // Pide la contraseña actual (re-autenticando) antes de aplicar la nueva, para
  // confirmar que quien hace el cambio realmente conoce la contraseña vigente.
  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user.value?.email) throw new Error('No se pudo verificar tu cuenta')

    const { error: verifyError } = await client.auth.signInWithPassword({
      email: user.value.email,
      password: currentPassword,
    })
    if (verifyError) throw new Error('La contraseña actual es incorrecta')

    const { error: updateError } = await client.auth.updateUser({ password: newPassword })
    if (updateError) throw updateError
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

  return {
    profile,
    role,
    isAdmin,
    isStaff,
    puntoVentaNombre,
    loading,
    fetchProfile,
    updateProfile,
    changePassword,
    uploadAvatar,
  }
}
