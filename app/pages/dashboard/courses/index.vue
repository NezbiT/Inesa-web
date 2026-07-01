<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'admin' })

const { getCourses } = useLms()
const { data: courses, refresh } = await useAsyncData('dash-courses', () => getCourses())

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    published: 'Publicado',
    archived: 'Archivado',
  }
  return labels[status] || status
}
</script>

<template>
  <div>
    <header class="lms-page-header lms-page-header--row">
      <h1>Cursos</h1>
      <NuxtLink to="/dashboard/courses/new" class="lms-btn lms-btn--primary">
        + Nuevo curso
      </NuxtLink>
    </header>

    <div v-if="courses?.length" class="lms-grid">
      <article v-for="course in courses" :key="course.id" class="lms-course-card">
        <div class="lms-course-card__thumb">{{ course.title.charAt(0) }}</div>
        <div class="lms-course-card__body">
          <span class="lms-badge" :class="`lms-badge--${course.status}`">
            {{ statusLabel(course.status) }}
          </span>
          <h3>{{ course.title }}</h3>
          <p>{{ course.description || 'Sin descripción' }}</p>
          <NuxtLink :to="`/dashboard/courses/${course.id}`" class="lms-btn lms-btn--secondary lms-btn--sm">
            Editar curso
          </NuxtLink>
        </div>
      </article>
    </div>

    <p v-else class="lms-empty">
      No hay cursos. Crea uno subiendo un PDF con el material de estudio.
    </p>
  </div>
</template>

<style scoped>
.lms-page-header {
  margin-bottom: 1.6rem;
}

.lms-page-header h1 {
  font-family: var(--font-sans);
  font-size: 2rem;
  font-weight: 700;
}

.lms-page-header--row {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
</style>