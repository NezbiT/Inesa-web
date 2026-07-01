<script setup lang="ts">
import type { Lesson } from '#shared/types/lms'

definePageMeta({ layout: 'learn', middleware: 'auth' })

const route = useRoute()
const slug = route.params.slug as string
const lessonId = route.params.lessonId as string

const { getCourse, saveProgress, lessonIcon } = useLms()

const { data, refresh } = await useAsyncData(`player-${slug}-${lessonId}`, () => getCourse(slug))

const course = computed(() => data.value?.course)
const lessons = computed(() => data.value?.lessons ?? [])
const current = computed(() => lessons.value.find((l) => l.id === lessonId))

const progressMap = computed(() => {
  const map = new Map<string, { percent: number; completed: boolean }>()
  for (const p of data.value?.progress ?? []) {
    map.set(p.lesson_id, { percent: p.progress_percent, completed: Boolean(p.completed) })
  }
  return map
})

let progressTimer: ReturnType<typeof setInterval> | null = null

async function reportProgress(percent: number, position = 0, completed = false) {
  if (!current.value) return
  await saveProgress(current.value.id, {
    progressPercent: percent,
    lastPositionSeconds: position,
    completed,
  })
}

function onVideoTime(e: Event) {
  const video = e.target as HTMLVideoElement
  if (!video.duration) return
  const percent = Math.round((video.currentTime / video.duration) * 100)
  reportProgress(percent, Math.floor(video.currentTime), percent >= 95)
}

function onAudioTime(e: Event) {
  const audio = e.target as HTMLAudioElement
  if (!audio.duration) return
  const percent = Math.round((audio.currentTime / audio.duration) * 100)
  reportProgress(percent, Math.floor(audio.currentTime), percent >= 95)
}

function markTextComplete() {
  reportProgress(100, 0, true)
  refresh()
}

onMounted(() => {
  if (current.value?.type === 'text' || current.value?.type === 'pdf') {
    progressTimer = setInterval(() => reportProgress(50), 5000)
  }
})

onUnmounted(() => {
  if (progressTimer) clearInterval(progressTimer)
})

watch(lessonId, () => refresh())
</script>

<template>
  <div v-if="course && current" class="lms-player">
    <aside class="lms-player__sidebar">
      <h2>{{ course.title }}</h2>
      <nav>
        <NuxtLink
          v-for="lesson in lessons"
          :key="lesson.id"
          :to="`/learn/${slug}/${lesson.id}`"
          class="lms-player__lesson-link"
          :class="{
            active: lesson.id === lessonId,
            done: progressMap.get(lesson.id)?.completed,
          }"
        >
          <span>{{ lessonIcon(lesson.type) }}</span>
          {{ lesson.title }}
        </NuxtLink>
      </nav>
    </aside>

    <section class="lms-player__content">
      <h1>{{ current.title }}</h1>
      <p v-if="current.description" class="lms-lesson-desc">{{ current.description }}</p>

      <div v-if="current.type === 'video' && current.contentUrl" class="lms-player__media">
        <video
          :src="current.contentUrl"
          controls
          @timeupdate="onVideoTime"
          @ended="reportProgress(100, 0, true)"
        />
      </div>

      <div v-else-if="current.type === 'audio' && current.contentUrl" class="lms-player__media">
        <audio
          :src="current.contentUrl"
          controls
          @timeupdate="onAudioTime"
          @ended="reportProgress(100, 0, true)"
        />
      </div>

      <iframe
        v-else-if="current.type === 'pdf' && current.contentUrl"
        :src="current.contentUrl"
        class="lms-player__pdf"
        title="PDF"
      />

      <div v-else-if="current.contentText" class="lms-player__text">
        {{ current.contentText }}
      </div>

      <p v-else class="lms-empty">Contenido no disponible.</p>

      <div v-if="current.type === 'text' || current.type === 'pdf'" class="lms-player__actions">
        <button type="button" class="lms-btn lms-btn--primary" @click="markTextComplete">
          Marcar como completada
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.lms-lesson-desc {
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-sans);
  font-size: 1.3rem;
  margin-bottom: 1.4rem;
}

.lms-player__actions {
  margin-top: 1.4rem;
}
</style>