import type { LessonProgress } from '#shared/types/lms'

export function useLessonProgressMap(
  progress: Ref<LessonProgress[] | undefined> | ComputedRef<LessonProgress[] | undefined>,
) {
  return computed(() => {
    const map = new Map<string, { percent: number; completed: boolean }>()
    for (const p of progress.value ?? []) {
      map.set(p.lessonId, { percent: p.progressPercent, completed: p.completed })
    }
    return map
  })
}