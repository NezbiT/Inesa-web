<script setup lang="ts">
import type { User } from '#shared/types/lms'
import { isSafeLearnRedirect, resolvePostLoginPath } from '~/utils/academyRedirect'

definePageMeta({ layout: 'blank' })

useSiteSeo({
  title: 'INESA Academy — Login',
  description: 'Acceso de estudiantes e instructores a la plataforma de formación INESA.',
  path: '/academy/login',
  noindex: true,
})

type LoginRole = 'student' | 'admin'

const route = useRoute()
const router = useRouter()
const { login, logout, user, fetchUser } = useAuth()

const activeRole = ref<LoginRole>('student')
const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const pendingCourse = computed(() =>
  isSafeLearnRedirect(route.query.redirect) ? route.query.redirect : null,
)

const DEMO = {
  student: { email: 'estudiante@inesa.com', password: 'estudiante123' },
  admin: { email: 'admin@inesa.com', password: 'admin123' },
} as const

function parseRoleQuery(value: unknown): LoginRole {
  if (value === 'admin' || value === 'instructor') return 'admin'
  return 'student'
}

function setRole(role: LoginRole) {
  activeRole.value = role
  error.value = ''
  const query: Record<string, string> = { role: role === 'admin' ? 'instructor' : 'student' }
  if (pendingCourse.value) query.redirect = pendingCourse.value
  router.replace({ query })
}

function fillDemo() {
  const creds = DEMO[activeRole.value]
  email.value = creds.email
  password.value = creds.password
}

async function redirectAfterAuth(role: User['role']) {
  await navigateTo(resolvePostLoginPath(role, route.query.redirect))
}

onMounted(async () => {
  activeRole.value = parseRoleQuery(route.query.role)
  await fetchUser()
  if (user.value) {
    await redirectAfterAuth(user.value.role)
  }
})

watch(
  () => route.query.role,
  (value) => {
    activeRole.value = parseRoleQuery(value)
  },
)

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const loggedIn = await login(email.value.trim(), password.value)

    if (activeRole.value === 'admin' && loggedIn.role !== 'admin') {
      await logout(null)
      error.value =
        'Esta cuenta es de estudiante. Usa la pestaña Estudiante o credenciales de instructor (admin@inesa.com).'
      return
    }

    await redirectAfterAuth(loggedIn.role)
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
      <UiResponsiveImage
        src="/images/branding/logo-layers/logo-closed.png"
        webp-src="/images/branding/logo-layers/logo-closed.webp"
        alt="INESA"
        width="96"
        height="96"
        loading="eager"
        class="lms-login__logo"
      />
      <h1>INESA Academy</h1>
      <p>Elige cómo quieres entrar a la plataforma</p>

      <p v-if="pendingCourse && activeRole === 'student'" class="lms-login__pending-course">
        Tras iniciar sesión irás al curso que elegiste. Si no estás inscrito, podrás inscribirte ahí.
      </p>

      <div class="lms-login__tabs" role="tablist">
        <button
          type="button"
          role="tab"
          class="lms-login__tab"
          :class="{ 'lms-login__tab--active': activeRole === 'student' }"
          :aria-selected="activeRole === 'student'"
          @click="setRole('student')"
        >
          Estudiante
        </button>
        <button
          type="button"
          role="tab"
          class="lms-login__tab"
          :class="{ 'lms-login__tab--active': activeRole === 'admin' }"
          :aria-selected="activeRole === 'admin'"
          @click="setRole('admin')"
        >
          Instructor
        </button>
      </div>

      <div
        class="lms-login__role-panel"
        :class="`lms-login__role-panel--${activeRole}`"
        role="tabpanel"
      >
        <p v-if="activeRole === 'student'" class="lms-login__role-hint">
          Accede a tus cursos, lecciones y cuestionarios.
        </p>
        <p v-else class="lms-login__role-hint">
          Gestiona cursos, estudiantes y contenido con IA. Solo cuentas de instructor pueden crear cursos.
        </p>

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

          <button
            type="submit"
            class="lms-btn lms-login__submit"
            :class="activeRole === 'student' ? 'lms-btn--student' : 'lms-btn--primary'"
            :disabled="loading"
          >
            {{ loading ? 'Entrando…' : activeRole === 'student' ? 'Entrar como estudiante' : 'Entrar como instructor' }}
          </button>
        </form>

        <div class="lms-login__demo">
          <p class="lms-login__demo-title">Cuenta de demostración</p>
          <p v-if="activeRole === 'student'">
            <strong>Estudiante:</strong> estudiante@inesa.com / estudiante123
          </p>
          <p v-else>
            <strong>Instructor:</strong> admin@inesa.com / admin123
          </p>
          <button type="button" class="lms-btn lms-btn--ghost lms-btn--sm" @click="fillDemo">
            Usar credenciales demo
          </button>
        </div>
      </div>

      <p class="lms-login__footer">
        <NuxtLink to="/academy">← Volver al catálogo</NuxtLink>
      </p>
    </div>
  </div>
</template>