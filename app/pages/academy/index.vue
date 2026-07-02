<script setup lang="ts">
import type { CatalogCourse } from '#shared/types/api'

definePageMeta({ layout: 'blank' })

const { getCourses, enroll } = useLms()
const { user, fetchUser } = useAuth()

const { data: courses, refresh } = await useAsyncData(
  'academy-courses',
  () => getCourses({ catalog: true }),
  { server: false },
)

async function reloadCatalog() {
  await fetchUser()
  await refresh()
}

onMounted(() => reloadCatalog())

watch(
  () => user.value?.id,
  () => refresh(),
)

const enrolling = ref<string | null>(null)

function courseActionLabel(course: CatalogCourse) {
  if (!user.value || user.value.role !== 'student') return 'Ver curso'
  return course.enrolled ? 'Continuar curso' : 'Inscribirme'
}

async function onCourseAction(course: CatalogCourse) {
  const target = `/learn/${course.slug}`

  if (!user.value) {
    await navigateTo({
      path: '/academy/login',
      query: { role: 'student', redirect: target },
    })
    return
  }

  if (user.value.role === 'admin') {
    await navigateTo(target)
    return
  }

  if (course.enrolled) {
    await navigateTo(target)
    return
  }

  enrolling.value = course.id
  try {
    await enroll(course.id)
    await navigateTo(target)
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
        <NuxtLink to="/academy/login?role=student" class="lms-btn lms-btn--student">
          Entrar como estudiante
        </NuxtLink>
        <NuxtLink to="/academy/login?role=instructor" class="lms-btn lms-btn--secondary">
          Entrar como instructor
        </NuxtLink>
        <NuxtLink
          v-if="user?.role === 'student'"
          to="/learn"
          class="lms-btn lms-btn--primary"
        >
          Mis cursos
        </NuxtLink>
        <NuxtLink
          v-else-if="user?.role === 'admin'"
          to="/dashboard"
          class="lms-btn lms-btn--ghost"
        >
          Ir al dashboard
        </NuxtLink>
      </div>
    </section>

    <div class="lms-academy-body">
      <h2>Cursos disponibles</h2>

      <div v-if="courses?.length" class="lms-grid">
        <LmsCourseCard
          v-for="course in courses"
          :key="course.id"
          :title="course.title"
          :description="course.description"
          description-fallback="Curso de evaluación sensorial INESA."
          :status="user?.role === 'admin' ? course.status : undefined"
        >
          <span v-if="user?.role === 'student' && course.enrolled" class="lms-badge lms-badge--published">
            Inscrito
          </span>
          <button
            type="button"
            class="lms-btn lms-btn--primary lms-btn--sm"
            :class="{ 'lms-btn--student': !user && !course.enrolled }"
            :disabled="enrolling === course.id"
            @click="onCourseAction(course)"
          >
            {{ enrolling === course.id ? 'Inscribiendo…' : courseActionLabel(course) }}
          </button>
        </LmsCourseCard>
      </div>

      <div v-else class="lms-empty lms-empty--cta">
        <p v-if="user?.role === 'admin'">
          No hay cursos visibles en el catálogo. Créalos desde el dashboard y publícalos.
        </p>
        <p v-else>
          Próximamente nuevos cursos. El instructor está preparando el contenido.
        </p>
        <NuxtLink v-if="user?.role === 'admin'" to="/dashboard/courses/new" class="lms-btn lms-btn--primary">
          Crear curso
        </NuxtLink>
      </div>
    </div>
  </div>
</template>