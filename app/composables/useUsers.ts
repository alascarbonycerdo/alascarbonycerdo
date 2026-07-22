import type { StaffUser } from '#shared/types/admin'

export interface CreateUserPayload {
  email: string
  password: string
  nombre?: string
  role: string
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

  const updateRole = async (id: string, role: string) => {
    await $fetch(`/api/admin/users/${id}`, { method: 'PATCH', body: { role } })
    await load()
  }

  return { users, pending, error, load, createUser, updateRole }
}
