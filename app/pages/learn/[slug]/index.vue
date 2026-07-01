<script setup lang="ts">
definePageMeta({ layout: 'learn', middleware: 'auth' })

const route = useRoute()
const slug = route.params.slug as string
const { getCourse, enroll, lessonIcon } = useLms()

const { data, refresh } = await useAsyncData(`learn-course-${slug}`, () => getCourse(slug))

const course = computed(() => data.value?.course)
const lessons = computed(() => data.value?.lessons ?? [])
const enrolled = computed(() => data.value?.enrolled ?? false)

const progressMap = computed(() => {
  const map = new Map<string, { percent: number; completed: boolean }>()
  for (const p of data.value?.progress ?? []) {
    map.set(p.lesson_id, { percent: p.progress_percent, completed: Boolean(p.completed) })
  }
  return map
})

const enrolling = ref(false)

async function onEnroll() {
  if (!course.value) return
  enrolling.value = true
  try {
    await enroll(course.value.id)
    await refresh()
    if (lessons.value[0]) {
      await navigateTo(`/learn/${slug}/${lessons.value[0].id}`)
    }
  } finally {
    enrolling.value = false
  }
}

watch(
  () => [enrolled.value, lessons.value.length] as const,
  async ([isEnrolled, count]) => {
    if (isEnrolled && count > 0 && route.path === `/learn/${slug}`) {
      const first = lessons.value[0]
      if (first) await navigateTo(`/learn/${slug}/${first.id}`)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div v-if="course" class="lms-learn-course">
    <div v-if="!enrolled" class="lms-learn-enroll">
      <h1>{{ course.title }}</h1>
      <p>{{ course.description }}</p>
      <p>{{ lessons.length }} lecciones disponibles</p>
      <button type="button" class="lms-btn lms-btn--primary" :disabled="enrolling" @click="onEnroll">
        {{ enrolling ? 'Inscribiendo…' : 'Comenzar curso' }}
      </button>
    </div>

    <div v-else-if="!lessons.length" class="lms-empty-block">
      <p>Este curso aún no tiene lecciones.</p>
      <NuxtLink to="/learn" class="lms-btn lms-btn--secondary">Volver</NuxtLink>
    </div>
  </div>
</template>

<style scoped>
.lms-learn-enroll {
  margin: 0 auto;
  max-width: 560px;
  padding: 4rem 2rem;
  text-align: center;
}

.lms-learn-enroll h1 {
  color: #fff;
  font-family: var(--font-sans);
  font-size: 2.4rem;
  margin-bottom: 1rem;
}

.lms-learn-enroll p {
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-sans);
  font-size: 1.4rem;
  margin-bottom: 0.8rem;
}

.lms-empty-block {
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-sans);
  padding: 4rem 2rem;
  text-align: center;
}
</style>