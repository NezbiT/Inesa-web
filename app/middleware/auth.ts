export default defineNuxtRouteMiddleware(async (to) => {
  const { user, fetchUser } = useAuth()
  if (!user.value) await fetchUser()
  if (!user.value) {
    return navigateTo({
      path: '/academy/login',
      query: { role: 'student', redirect: to.fullPath },
    })
  }
})