<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'admin' })

const { getStats, getActivity } = useLms()

const { data: stats } = await useAsyncData('dash-stats', () => getStats())
const { data: activity } = await useAsyncData('dash-activity', () => getActivity())
</script>

<template>
  <div>
    <LmsPageHeader title="Resumen" />

    <div class="lms-stats">
      <div class="lms-stat">
        <span class="lms-stat__value">{{ stats?.courses ?? 0 }}</span>
        <span class="lms-stat__label">Cursos</span>
      </div>
      <div class="lms-stat">
        <span class="lms-stat__value">{{ stats?.students ?? 0 }}</span>
        <span class="lms-stat__label">Estudiantes</span>
      </div>
      <div class="lms-stat">
        <span class="lms-stat__value">{{ stats?.lessons ?? 0 }}</span>
        <span class="lms-stat__label">Lecciones</span>
      </div>
      <div class="lms-stat">
        <span class="lms-stat__value">{{ stats?.completions ?? 0 }}</span>
        <span class="lms-stat__label">Completadas</span>
      </div>
    </div>

    <div class="lms-split">
      <section class="lms-card">
        <div class="lms-card__header">
          <h2>Actividad reciente</h2>
          <NuxtLink to="/dashboard/students" class="lms-btn lms-btn--secondary lms-btn--sm">
            Ver estudiantes
          </NuxtLink>
        </div>

        <div v-if="activity?.length" class="lms-activity-feed">
          <div v-for="(item, i) in activity.slice(0, 8)" :key="i" class="lms-activity-item">
            <strong>{{ item.userName }}</strong>
            <span class="lms-activity-item__meta">
              {{ item.lessonTitle }} · {{ item.courseTitle }}
            </span>
            <div class="lms-progress" style="width: 80px">
              <div class="lms-progress__bar" :style="{ width: `${item.progressPercent}%` }" />
            </div>
          </div>
        </div>
        <p v-else class="lms-empty">Sin actividad todavía.</p>
      </section>

      <section class="lms-card">
        <div class="lms-card__header">
          <h2>Acciones rápidas</h2>
        </div>
        <div class="lms-quick-actions">
          <NuxtLink to="/dashboard/courses/new" class="lms-btn lms-btn--primary">
            Crear curso desde PDF
          </NuxtLink>
          <NuxtLink to="/dashboard/courses" class="lms-btn lms-btn--secondary">
            Gestionar cursos
          </NuxtLink>
          <NuxtLink to="/dashboard/students" class="lms-btn lms-btn--secondary">
            Agregar estudiante
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lms-quick-actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}
</style>