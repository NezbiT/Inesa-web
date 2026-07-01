<script setup lang="ts">
definePageMeta({ layout: 'learn', middleware: 'auth' })

const { getCourses } = useLms()
const { data: courses } = await useAsyncData('learn-courses', () => getCourses())
</script>

<template>
  <div class="lms-learn-home">
    <div class="lms-learn-home__inner">
      <h1>Mis cursos</h1>
      <p>Continúa tu formación en evaluación sensorial.</p>

      <div v-if="courses?.length" class="lms-grid">
        <NuxtLink
          v-for="course in courses"
          :key="course.id"
          :to="`/learn/${course.slug}`"
          class="lms-course-card lms-course-card--dark"
        >
          <div class="lms-course-card__thumb">{{ course.title.charAt(0) }}</div>
          <div class="lms-course-card__body">
            <h3>{{ course.title }}</h3>
            <p>{{ course.description || 'Curso INESA' }}</p>
            <span class="lms-btn lms-btn--primary lms-btn--sm">Continuar →</span>
          </div>
        </NuxtLink>
      </div>

      <div v-else class="lms-empty-block">
        <p>No estás inscrito en ningún curso todavía.</p>
        <NuxtLink to="/academy" class="lms-btn lms-btn--primary">
          Explorar catálogo
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lms-learn-home {
  padding: 2.4rem 2rem 4rem;
}

.lms-learn-home__inner {
  margin: 0 auto;
  max-width: 1100px;
}

.lms-learn-home h1 {
  color: #fff;
  font-family: var(--font-sans);
  font-size: 2.4rem;
  margin-bottom: 0.4rem;
}

.lms-learn-home > .lms-learn-home__inner > p {
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-sans);
  font-size: 1.4rem;
  margin-bottom: 2rem;
}

.lms-course-card--dark {
  background: #1a1f26;
  border-color: rgba(255, 255, 255, 0.08);
  color: #fff;
  text-decoration: none;
}

.lms-course-card--dark:hover {
  color: #fff;
}

.lms-course-card--dark .lms-course-card__body p {
  color: rgba(255, 255, 255, 0.55);
}

.lms-empty-block {
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-sans);
  padding: 3rem;
  text-align: center;
}

.lms-empty-block p {
  margin-bottom: 1.2rem;
}
</style>