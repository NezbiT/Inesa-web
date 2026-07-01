<script setup lang="ts">
import type { Lesson } from '#shared/types/lms'

definePageMeta({ layout: 'dashboard', middleware: 'admin' })

const route = useRoute()
const courseId = route.params.id as string
const { getCourse, updateCourse, generateLessons, addLesson, lessonIcon } = useLms()

const { data, refresh } = await useAsyncData(`course-${courseId}`, () => getCourse(courseId))

const lessons = computed(() => data.value?.lessons ?? [])

const editTitle = ref('')
const editDescription = ref('')
const editStatus = ref<'draft' | 'published' | 'archived'>('draft')

watch(
  () => data.value?.course,
  (c) => {
    if (!c) return
    editTitle.value = c.title
    editDescription.value = c.description
    editStatus.value = c.status
  },
  { immediate: true },
)

const saving = ref(false)
const generating = ref(false)
const adding = ref(false)
const message = ref('')

const lessonTitle = ref('')
const lessonType = ref<Lesson['type']>('video')
const lessonFile = ref<File | null>(null)
const lessonText = ref('')

async function saveCourse() {
  saving.value = true
  message.value = ''
  try {
    await updateCourse(courseId, {
      title: editTitle.value,
      description: editDescription.value,
      status: editStatus.value,
    })
    message.value = 'Curso guardado.'
    await refresh()
  } catch {
    message.value = 'Error al guardar.'
  } finally {
    saving.value = false
  }
}

async function onGenerate() {
  generating.value = true
  message.value = ''
  try {
    await generateLessons(courseId)
    message.value = 'Lecciones regeneradas con IA.'
    await refresh()
  } catch {
    message.value = 'Sube un PDF primero o el material no tiene texto.'
  } finally {
    generating.value = false
  }
}

function onLessonFile(e: Event) {
  const input = e.target as HTMLInputElement
  lessonFile.value = input.files?.[0] ?? null
}

async function onAddLesson() {
  if (!lessonTitle.value.trim()) return
  adding.value = true
  message.value = ''
  try {
    const form = new FormData()
    form.append('title', lessonTitle.value.trim())
    form.append('type', lessonType.value)
    if (lessonText.value) form.append('contentText', lessonText.value)
    if (lessonFile.value) form.append('file', lessonFile.value)

    await addLesson(courseId, form)
    lessonTitle.value = ''
    lessonText.value = ''
    lessonFile.value = null
    message.value = 'Lección agregada.'
    await refresh()
  } catch {
    message.value = 'Error al agregar lección.'
  } finally {
    adding.value = false
  }
}
</script>

<template>
  <div v-if="data?.course">
    <header class="lms-page-header lms-page-header--row">
      <div>
        <h1>{{ editTitle }}</h1>
        <span class="lms-badge" :class="`lms-badge--${editStatus}`">{{ editStatus }}</span>
      </div>
      <NuxtLink to="/dashboard/courses" class="lms-btn lms-btn--secondary lms-btn--sm">
        ← Volver
      </NuxtLink>
    </header>

    <p v-if="message" class="lms-alert lms-alert--success">{{ message }}</p>

    <section class="lms-card">
      <h2>Configuración</h2>
      <form class="lms-form" @submit.prevent="saveCourse">
        <label>
          Título
          <input v-model="editTitle" type="text" required />
        </label>
        <label>
          Descripción
          <textarea v-model="editDescription" rows="3" />
        </label>
        <label>
          Estado
          <select v-model="editStatus">
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>
        <button type="submit" class="lms-btn lms-btn--primary" :disabled="saving">
          {{ saving ? 'Guardando…' : 'Guardar cambios' }}
        </button>
      </form>
    </section>

    <section class="lms-card">
      <div class="lms-card__header">
        <h2>Lecciones ({{ lessons.length }})</h2>
        <button
          type="button"
          class="lms-btn lms-btn--secondary lms-btn--sm"
          :disabled="generating"
          @click="onGenerate"
        >
          {{ generating ? 'Generando…' : 'Regenerar con IA' }}
        </button>
      </div>

      <ul v-if="lessons.length" class="lms-lesson-list">
        <li v-for="lesson in lessons" :key="lesson.id" class="lms-lesson-item">
          <span class="lms-lesson-item__icon">{{ lessonIcon(lesson.type) }}</span>
          <span class="lms-lesson-item__title">{{ lesson.title }}</span>
          <span class="lms-lesson-item__type">{{ lesson.type }}</span>
        </li>
      </ul>
      <p v-else class="lms-empty">Sin lecciones. Sube un PDF o agrega contenido manualmente.</p>
    </section>

    <section class="lms-card">
      <h2>Agregar lección</h2>
      <form class="lms-form" @submit.prevent="onAddLesson">
        <label>
          Título
          <input v-model="lessonTitle" type="text" required />
        </label>
        <label>
          Tipo
          <select v-model="lessonType">
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="pdf">PDF</option>
            <option value="text">Texto</option>
          </select>
        </label>
        <label v-if="lessonType === 'text'">
          Contenido
          <textarea v-model="lessonText" rows="5" />
        </label>
        <label v-else>
          Archivo (video, audio o PDF)
          <input type="file" @change="onLessonFile" />
        </label>
        <button type="submit" class="lms-btn lms-btn--primary" :disabled="adding">
          {{ adding ? 'Subiendo…' : 'Agregar lección' }}
        </button>
      </form>
    </section>
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
  margin-bottom: 0.4rem;
}

.lms-page-header--row {
  align-items: start;
  display: flex;
  justify-content: space-between;
}
</style>