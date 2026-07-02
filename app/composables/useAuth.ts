import type { AuthLoginResponse } from '#shared/types/api'
import type { User } from '#shared/types/lms'
import { apiFetch } from '~/utils/apiFetch'

export function useAuth() {
  const user = useState<User | null>('auth-user', () => null)
  const loading = useState('auth-loading', () => false)
  const checked = useState('auth-checked', () => false)

  async function fetchUser(): Promise<User | null> {
    loading.value = true
    try {
      const res = await apiFetch<{ user: User }>('/api/auth/me')
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

  async function login(email: string, password: string): Promise<User> {
    const res = await apiFetch<AuthLoginResponse>('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    user.value = res.user
    checked.value = true
    return res.user
  }

  async function logout(redirectTo?: string | null): Promise<void> {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* cookie may already be cleared */
    }
    user.value = null
    checked.value = true
    if (redirectTo !== null) {
      await navigateTo(redirectTo ?? '/academy/login?role=student')
    }
  }

  const isAdmin = computed(() => user.value?.role === 'admin')
  const isStudent = computed(() => user.value?.role === 'student')

  return { user, loading, checked, fetchUser, login, logout, isAdmin, isStudent }
}