export default defineNuxtRouteMiddleware(async () => {
  const user = useSupabaseUser()
  if (!user.value) return navigateTo('/login')

  const { isStaff, fetchProfile } = useProfile()
  await fetchProfile()
  if (!isStaff.value) return navigateTo('/login')
})
