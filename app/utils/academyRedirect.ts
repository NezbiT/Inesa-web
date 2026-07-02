import type { User } from '#shared/types/lms'

export function isSafeLearnRedirect(path: unknown): path is string {
  return typeof path === 'string' && path.startsWith('/learn/') && !path.includes('//')
}

export function resolvePostLoginPath(role: User['role'], redirect: unknown): string {
  if (role === 'student' && isSafeLearnRedirect(redirect)) return redirect
  return role === 'admin' ? '/dashboard' : '/learn'
}