import type { StaffUser } from '#shared/types/admin'

export interface CreateUserPayload {
  email: string
  password: string
  nombre?: string
  role: string
  puntoVentaId?: string | null
}

export interface UpdateUserPayload {
  nombre?: string
  role?: string
  email?: string
  password?: string
  puntoVentaId?: string | null
}

export const useUsers = () => {
  const users = useState<StaffUser[]>('admin-users', () => [])
  const pending = useState('admin-users-pending', () => false)
  const error = useState<string | null>('admin-users-error', () => null)

  const requestFetch = useRequestFetch()

  const load = async () => {
    pending.value = true
    error.value = null
    try {
      users.value = await requestFetch<StaffUser[]>('/api/admin/users')
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'No se pudieron cargar los usuarios'
    } finally {
      pending.value = false
    }
    return true
  }

  const createUser = async (payload: CreateUserPayload) => {
    await $fetch('/api/admin/users', { method: 'POST', body: payload })
    await load()
  }

  const updateUser = async (id: string, payload: UpdateUserPayload) => {
    await $fetch(`/api/admin/users/${id}`, { method: 'PATCH', body: payload })
    await load()
  }

  const deleteUser = async (id: string) => {
    await $fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    await load()
  }

  return { users, pending, error, load, createUser, updateUser, deleteUser }
}
