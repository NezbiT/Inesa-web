<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'admin' })

const { createCourse } = useLms()

const title = ref('')
const description = ref('')
const pdfFile = ref<File | null>(null)
const loading = ref(false)
const error = ref('')

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  pdfFile.value = input.files?.[0] ?? null
}

async function onSubmit() {
  error.value = ''
  if (!title.value.trim()) {
    error.value = 'El título es obligatorio.'
    return
  }
  if (!pdfFile.value) {
    error.value = 'Debes subir un PDF con el material del curso.'
    return
  }

  loading.value = true
  try {
    const form = new FormData()
    form.append('title', title.value.trim())
    form.append('description', description.value.trim())
    form.append('pdf', pdfFile.value)

    const { course } = await createCourse(form)
    await navigateTo(`/dashboard/courses/${course.id}`)
  } catch (e: unknown) {
    const err = e as { data?: { statusMessage?: string }; statusMessage?: string; message?: string }
    error.value =
      err.data?.statusMessage || err.statusMessage || err.message || 'No se pudo crear el curso.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <LmsPageHeader
      title="Nuevo curso"
      subtitle="Sube un PDF y la IA generará lecciones automáticamente a partir del material."
    />

    <section class="lms-card">
      <p v-if="error" class="lms-alert lms-alert--error">{{ error }}</p>

      <form class="lms-form" @submit.prevent="onSubmit">
        <label>
          Título del curso
          <input v-model="title" type="text" required placeholder="Ej. Evaluación sensorial básica" />
        </label>

        <label>
          Descripción
          <textarea v-model="description" rows="3" placeholder="Breve descripción del curso" />
        </label>

        <label>
          Material PDF
          <input type="file" accept=".pdf,application/pdf" required @change="onFileChange" />
        </label>
        <p class="lms-form-hint">Usa Google Gemini gratis (aistudio.google.com/apikey). Lee el PDF y crea lecciones + cuestionario.</p>

        <div class="lms-form-actions">
          <button type="submit" class="lms-btn lms-btn--primary" :disabled="loading">
            {{ loading ? 'Creando con IA…' : 'Crear curso' }}
          </button>
          <NuxtLink to="/dashboard/courses" class="lms-btn lms-btn--secondary">
            Cancelar
          </NuxtLink>
        </div>
      </form>
    </section>
  </div>
</template>

<style scoped>
.lms-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
}

.lms-form-hint {
  color: var(--color-muted);
  font-family: var(--font-sans);
  font-size: 1.2rem;
  margin-top: -0.4rem;
}
</style>