import type { Database } from '~/types/database.types'

interface Profile {
  role: string
  nombre: string | null
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
    const { data, error } = await client.from('profiles').select('role, nombre').eq('id', user.value.sub).single()
    if (error) console.error('[useProfile] No se pudo cargar el perfil:', error.message)
    profile.value = data
    loading.value = false
  }

  const role = computed(() => profile.value?.role ?? null)
  const isAdmin = computed(() => role.value === 'administrador')
  const isStaff = computed(() => role.value === 'vendedor' || role.value === 'administrador')

  return { profile, role, isAdmin, isStaff, loading, fetchProfile }
}
