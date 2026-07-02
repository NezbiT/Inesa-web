<script setup lang="ts">
import type { CourseStatus } from '#shared/types/lms'

defineProps<{
  title: string
  description?: string | null
  descriptionFallback?: string
  status?: CourseStatus
  to?: string
  variant?: 'default' | 'dark'
}>()

const statusLabels: Record<CourseStatus, string> = {
  draft: 'Borrador',
  published: 'Publicado',
  archived: 'Archivado',
}
</script>

<template>
  <component
    :is="to ? 'NuxtLink' : 'article'"
    :to="to"
    class="lms-course-card"
    :class="{ 'lms-course-card--dark': variant === 'dark' }"
  >
    <div class="lms-course-card__thumb">{{ title.charAt(0) }}</div>
    <div class="lms-course-card__body">
      <span v-if="status" class="lms-badge" :class="`lms-badge--${status}`">
        {{ statusLabels[status] }}
      </span>
      <h3>{{ title }}</h3>
      <p>{{ description || descriptionFallback }}</p>
      <slot />
    </div>
  </component>
</template>