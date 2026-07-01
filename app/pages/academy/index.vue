<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { getCourses, enroll } = useLms()
const { user, fetchUser } = useAuth()

const { data: courses, refresh } = await useAsyncData('academy-courses', () => getCourses())

onMounted(() => fetchUser())

const enrolling = ref<string | null>(null)

async function onEnroll(courseId: string) {
  if (!user.value) {
    await navigateTo('/academy/login')
    return
  }
  enrolling.value = courseId
  try {
    await enroll(courseId)
    await navigateTo(`/learn/${courses.value?.find((c) => c.id === courseId)?.slug || courseId}`)
  } catch {
    await refresh()
  } finally {
    enrolling.value = null
  }
}
</script>

<template>
  <div class="lms-academy">
    <section class="lms-academy-hero">
      <img src="/logo-inesa.png" alt="INESA" width="72" height="72" style="margin: 0 auto 1.2rem" />
      <h1>INESA Academy</h1>
      <p>Cursos de evaluación sensorial con video, audio y material de estudio generado con IA.</p>
      <div class="lms-academy-hero__actions">
        <NuxtLink
          v-if="user"
          :to="user.role === 'admin' ? '/dashboard' : '/learn'"
          class="lms-btn lms-btn--primary"
        >
          {{ user.role === 'admin' ? 'Ir al dashboard' : 'Mis cursos' }}
        </NuxtLink>
        <NuxtLink v-else to="/academy/login" class="lms-btn lms-btn--primary">
          Iniciar sesión
        </NuxtLink>
        <NuxtLink to="/" class="lms-btn lms-btn--ghost">
          Sitio INESA
        </NuxtLink>
      </div>
    </section>

    <div class="lms-academy-body">
      <h2>Cursos disponibles</h2>

      <div v-if="courses?.length" class="lms-grid">
        <article v-for="course in courses" :key="course.id" class="lms-course-card">
          <div class="lms-course-card__thumb">{{ course.title.charAt(0) }}</div>
          <div class="lms-course-card__body">
            <h3>{{ course.title }}</h3>
            <p>{{ course.description || 'Curso de evaluación sensorial INESA.' }}</p>
            <button
              type="button"
              class="lms-btn lms-btn--primary lms-btn--sm"
              :disabled="enrolling === course.id"
              @click="onEnroll(course.id)"
            >
              {{ enrolling === course.id ? 'Inscribiendo…' : user ? 'Inscribirme' : 'Ver curso' }}
            </button>
          </div>
        </article>
      </div>

      <p v-else class="lms-empty">
        Próximamente nuevos cursos. El instructor está preparando el contenido.
      </p>
    </div>
  </div>
</template>