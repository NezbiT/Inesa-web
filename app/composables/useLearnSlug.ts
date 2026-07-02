export function useLearnSlug() {
  const route = useRoute()
  return computed(() => route.params.slug as string)
}