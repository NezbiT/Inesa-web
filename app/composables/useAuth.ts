import type { User } from '#shared/types/lms'

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => false)
  const checked = useState('auth-checked', () => false)

  async function fetchUser() {
    loading.value = true
    try {
      const res = await $fetch<{ user: User }>('/api/auth/me')
      user.value = res.user
      return res.user
    } catch {
      user.value = null
      return null
    } finally {
      loading.value = false
      checked.value = true
    }
  }

  async function login(email: string, password: string) {
    const res = await $fetch<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = res.user
    checked.value = true
    return res.user
  }

  async function logout() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/academy/login')
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStudent = computed(() => user.value?.role === 'student')

  return { user, loading, checked, fetchUser, login, logout, isAdmin, isStudent }
}