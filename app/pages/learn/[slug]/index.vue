<script setup lang="ts">
definePageMeta({ layout: 'learn', middleware: 'auth' })

const slug = useLearnSlug().value
const { getCourse, enroll, lessonIcon } = useLms()

const { data, refresh } = await useAsyncData(`learn-course-${slug}`, () => getCourse(slug))

const course = computed(() => data.value?.course)
const lessons = computed(() => data.value?.lessons ?? [])
const enrolled = computed(() => data.value?.enrolled ?? false)

const progress = computed(() => data.value?.progress)
const progressMap = useLessonProgressMap(progress)

const enrolling = ref(false)

const continueLesson = computed(() => {
  const incomplete = lessons.value.find((l) => !progressMap.value.get(l.id)?.completed)
  return incomplete ?? lessons.value[0]
})

async function onEnroll() {
  if (!course.value) return
  enrolling.value = true
  try {
    await enroll(course.value.id)
    await refresh()
    if (continueLesson.value) {
      await navigateTo(`/learn/${slug}/${continueLesson.value.id}`)
    }
  } finally {
    enrolling.value = false
  }
}

async function goToLesson(lessonId: string) {
  await navigateTo(`/learn/${slug}/${lessonId}`)
}
</script>

<template>
  <div v-if="course" class="lms-learn-course">
    <div v-if="!enrolled" class="lms-learn-enroll">
      <h1>{{ course.title }}</h1>
      <p>{{ course.description }}</p>
      <p>{{ lessons.length }} lecciones disponibles</p>
      <button type="button" class="lms-btn lms-btn--student" :disabled="enrolling" @click="onEnroll">
        {{ enrolling ? 'Inscribiendo…' : 'Inscribirme en este curso' }}
      </button>
      <NuxtLink to="/academy" class="lms-btn lms-btn--ghost lms-btn--sm lms-learn-enroll__back">
        Ver otros cursos
      </NuxtLink>
    </div>

    <div v-else-if="!lessons.length" class="lms-empty-block">
      <p>Este curso aún no tiene lecciones.</p>
      <NuxtLink to="/learn" class="lms-btn lms-btn--secondary">Volver a mis cursos</NuxtLink>
    </div>

    <div v-else class="lms-learn-course__panel">
      <header class="lms-learn-course__header">
        <div>
          <h1>{{ course.title }}</h1>
          <p>{{ course.description }}</p>
        </div>
        <button
          v-if="continueLesson"
          type="button"
          class="lms-btn lms-btn--student"
          @click="goToLesson(continueLesson.id)"
        >
          Continuar curso →
        </button>
      </header>

      <ul class="lms-learn-lessons">
        <li v-for="lesson in lessons" :key="lesson.id">
          <button type="button" class="lms-learn-lesson" @click="goToLesson(lesson.id)">
            <span class="lms-learn-lesson__icon">{{ lessonIcon(lesson.type) }}</span>
            <span class="lms-learn-lesson__body">
              <strong>{{ lesson.title }}</strong>
              <span v-if="progressMap.get(lesson.id)?.completed" class="lms-learn-lesson__done">
                Completada
              </span>
              <span v-else-if="progressMap.get(lesson.id)" class="lms-learn-lesson__progress">
                {{ progressMap.get(lesson.id)?.percent }}%
              </span>
            </span>
          </button>
        </li>
      </ul>
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

.lms-learn-enroll__back {
  display: inline-block;
  margin-top: 1rem;
}

.lms-learn-course__panel {
  margin: 0 auto;
  max-width: 760px;
  padding: 2.4rem 2rem 4rem;
}

.lms-learn-course__header {
  align-items: flex-start;
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.lms-learn-course__header h1 {
  color: #fff;
  font-family: var(--font-sans);
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
}

.lms-learn-course__header p {
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-sans);
  font-size: 1.3rem;
}

.lms-learn-lessons {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.lms-learn-lesson {
  align-items: center;
  background: #1a1f26;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  color: #fff;
  cursor: pointer;
  display: flex;
  font-family: var(--font-sans);
  gap: 1rem;
  padding: 1rem 1.2rem;
  text-align: left;
  transition: border-color 0.2s, background 0.2s;
  width: 100%;
}

.lms-learn-lesson:hover {
  background: #222830;
  border-color: rgba(133, 170, 12, 0.4);
}

.lms-learn-lesson__icon {
  font-size: 1.6rem;
  width: 2rem;
}

.lms-learn-lesson__body {
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 0.6rem;
  justify-content: space-between;
}

.lms-learn-lesson__done {
  color: #85aa0c;
  font-size: 1.1rem;
  font-weight: 600;
}

.lms-learn-lesson__progress {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.1rem;
}

.lms-empty-block {
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-sans);
  padding: 4rem 2rem;
  text-align: center;
}
</style>