<script setup lang="ts">
const { user, fetchUser, logout } = useAuth()

onMounted(() => fetchUser())
</script>

<template>
  <header class="lms-academy-topbar">
    <NuxtLink to="/academy" class="lms-academy-topbar__brand">
      <UiResponsiveImage
        src="/logo-inesa.png"
        webp-src="/logo-inesa.webp"
        alt=""
        width="28"
        height="28"
        loading="eager"
      />
      INESA Academy
    </NuxtLink>

    <nav class="lms-academy-topbar__nav">
      <template v-if="user?.role === 'student'">
        <NuxtLink to="/learn" class="lms-academy-topbar__cta">Mis cursos</NuxtLink>
      </template>
      <template v-else-if="user?.role === 'admin'">
        <NuxtLink to="/dashboard/courses/new" class="lms-academy-topbar__cta">Crear curso</NuxtLink>
        <NuxtLink to="/dashboard" class="lms-academy-topbar__link">Dashboard</NuxtLink>
        <NuxtLink to="/learn" class="lms-academy-topbar__link">Vista estudiante</NuxtLink>
      </template>
      <template v-else>
        <NuxtLink to="/academy/login?role=student" class="lms-academy-topbar__cta">
          Entrar como estudiante
        </NuxtLink>
        <NuxtLink to="/academy/login?role=instructor" class="lms-academy-topbar__link">
          Instructor
        </NuxtLink>
      </template>
      <button v-if="user" type="button" class="lms-academy-topbar__link lms-academy-topbar__logout" @click="logout">
        Salir
      </button>
      <NuxtLink to="/" class="lms-academy-topbar__link">Sitio INESA</NuxtLink>
    </nav>
  </header>
</template>