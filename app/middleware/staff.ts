export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/login')

  const { isStaff, profile, fetchProfile } = useProfile()
  await fetchProfile()
  if (!isStaff.value) return navigateTo('/login')

  if (!profile.value?.activo) {
    const client = useSupabaseClient()
    await client.auth.signOut()
    return navigateTo('/login')
  }
})
