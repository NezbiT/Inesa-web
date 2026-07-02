export function apiFetch<T>(url: string, options?: Parameters<typeof $fetch<T>>[1]) {
  if (import.meta.server) {
    const requestFetch = useRequestFetch()
    return requestFetch<T>(url, options)
  }
  return $fetch<T>(url, { credentials: 'include', ...options })
}