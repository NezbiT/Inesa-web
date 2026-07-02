<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'admin' })

const { getCourses } = useLms()
const { data: courses } = await useAsyncData('dash-courses', () => getCourses())
</script>

<template>
  <div>
    <LmsPageHeader title="Cursos">
      <template #actions>
        <NuxtLink to="/dashboard/courses/new" class="lms-btn lms-btn--primary">
          + Nuevo curso
        </NuxtLink>
      </template>
    </LmsPageHeader>

    <div v-if="courses?.length" class="lms-grid">
      <LmsCourseCard
        v-for="course in courses"
        :key="course.id"
        :title="course.title"
        :description="course.description"
        description-fallback="Sin descripción"
        :status="course.status"
      >
        <NuxtLink :to="`/dashboard/courses/${course.id}`" class="lms-btn lms-btn--secondary lms-btn--sm">
          Editar curso
        </NuxtLink>
      </LmsCourseCard>
    </div>

    <div v-else class="lms-empty lms-empty--cta">
      <p>No hay cursos todavía.</p>
      <NuxtLink to="/dashboard/courses/new" class="lms-btn lms-btn--primary">
        + Crear primer curso
      </NuxtLink>
    </div>
  </div>
</template>