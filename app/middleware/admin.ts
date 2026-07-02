export default defineNuxtRouteMiddleware(async () => {
  const { user, fetchUser, isAdmin } = useAuth()
  if (!user.value) await fetchUser()
  if (!user.value) return navigateTo('/academy/login?role=instructor')
  if (!isAdmin.value) return navigateTo('/learn')
})