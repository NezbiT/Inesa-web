<script setup lang="ts">
import type { User } from '#shared/types/lms'

definePageMeta({ layout: 'blank' })

const { login, user, fetchUser } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function redirectForRole(role: User['role']) {
  return role === 'admin' ? '/dashboard' : '/learn'
}

onMounted(async () => {
  await fetchUser()
  if (user.value) {
    await navigateTo(redirectForRole(user.value.role))
  }
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const loggedIn = await login(email.value.trim(), password.value)
    await navigateTo(redirectForRole(loggedIn.role))
  } catch {
    error.value = 'Credenciales inválidas. Intenta de nuevo.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="lms-login">
    <div class="lms-login__card">
      <img src="/logo-inesa.png" alt="INESA" class="lms-login__logo" />
      <h1>INESA Academy</h1>
      <p>Plataforma de aprendizaje sensorial</p>

      <form class="lms-form" @submit.prevent="onSubmit">
        <p v-if="error" class="lms-login__error">{{ error }}</p>

        <label>
          Correo electrónico
          <input v-model="email" type="email" required autocomplete="email" />
        </label>

        <label>
          Contraseña
          <input v-model="password" type="password" required autocomplete="current-password" />
        </label>

        <button type="submit" class="lms-btn lms-btn--primary" :disabled="loading">
          {{ loading ? 'Entrando…' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="lms-login__demo">
        <p><strong>Instructor:</strong> admin@inesa.com / admin123</p>
        <p><strong>Estudiante:</strong> estudiante@inesa.com / estudiante123</p>
      </div>

      <p class="lms-login__footer">
        <NuxtLink to="/academy">← Volver al catálogo</NuxtLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.lms-login__demo {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.55);
  font-family: var(--font-sans);
  font-size: 1.15rem;
  line-height: 1.6;
  margin-top: 1.4rem;
  padding-top: 1.2rem;
}

.lms-login__demo strong {
  color: rgba(255, 255, 255, 0.75);
}
</style>