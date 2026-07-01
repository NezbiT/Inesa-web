<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const { login, user, fetchUser } = useAuth()
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(async () => {
  await fetchUser()
  if (user.value) {
    await navigateTo(user.value.role === 'admin' ? '/dashboard' : '/learn')
  }
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const u = await login(email.value, password.value)
    await navigateTo(u.role === 'admin' ? '/dashboard' : '/learn')
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

      <p class="lms-login__footer">
        <NuxtLink to="/academy">← Volver al catálogo</NuxtLink>
      </p>
    </div>
  </div>
</template>