export default defineNuxtRouteMiddleware(async () => {
  const { isAdmin, profile, fetchProfile } = useProfile()
  if (!profile.value) await fetchProfile()
  if (!isAdmin.value) return navigateTo('/dashboard')
})
