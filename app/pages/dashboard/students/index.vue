<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'admin' })

const { getStudents, createStudent, getActivity } = useLms()

const { data: students, refresh: refreshStudents } = await useAsyncData('dash-students', () => getStudents())
const { data: activity } = await useAsyncData('students-activity', () => getActivity())

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

async function onCreate() {
  error.value = ''
  success.value = ''
  loading.value = true
  try {
    await createStudent({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
    })
    name.value = ''
    email.value = ''
    password.value = ''
    success.value = 'Estudiante creado correctamente.'
    await refreshStudents()
  } catch {
    error.value = 'No se pudo crear el estudiante. Verifica que el correo no exista.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <header class="lms-page-header">
      <h1>Estudiantes</h1>
      <p>Crea cuentas y monitorea qué están estudiando en tiempo real.</p>
    </header>

    <div class="lms-split">
      <section class="lms-card">
        <h2>Nuevo estudiante</h2>
        <p v-if="error" class="lms-alert lms-alert--error">{{ error }}</p>
        <p v-if="success" class="lms-alert lms-alert--success">{{ success }}</p>

        <form class="lms-form" @submit.prevent="onCreate">
          <label>
            Nombre
            <input v-model="name" type="text" required />
          </label>
          <label>
            Correo
            <input v-model="email" type="email" required />
          </label>
          <label>
            Contraseña
            <input v-model="password" type="password" required minlength="6" />
          </label>
          <button type="submit" class="lms-btn lms-btn--primary" :disabled="loading">
            {{ loading ? 'Creando…' : 'Crear estudiante' }}
          </button>
        </form>
      </section>

      <section class="lms-card">
        <h2>Lista ({{ students?.length ?? 0 }})</h2>
        <table v-if="students?.length" class="lms-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Registro</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in students" :key="s.id">
              <td>{{ s.name }}</td>
              <td>{{ s.email }}</td>
              <td>{{ new Date(s.createdAt).toLocaleDateString('es') }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="lms-empty">Sin estudiantes registrados.</p>
      </section>
    </div>

    <section class="lms-card" style="margin-top: 1.2rem">
      <h2>Actividad de aprendizaje</h2>
      <table v-if="activity?.length" class="lms-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Curso</th>
            <th>Lección</th>
            <th>Progreso</th>
            <th>Última vez</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in activity" :key="i">
            <td>{{ item.userName }}</td>
            <td>{{ item.courseTitle }}</td>
            <td>{{ item.lessonTitle }}</td>
            <td>
              <div class="lms-progress" style="width: 100px">
                <div class="lms-progress__bar" :style="{ width: `${item.progressPercent}%` }" />
              </div>
              {{ item.completed ? '✓' : `${item.progressPercent}%` }}
            </td>
            <td>{{ new Date(item.updatedAt).toLocaleString('es') }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="lms-empty">Los estudiantes aún no han comenzado ninguna lección.</p>
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

.lms-page-header p {
  color: var(--color-muted);
  font-family: var(--font-sans);
  font-size: 1.3rem;
}
</style>