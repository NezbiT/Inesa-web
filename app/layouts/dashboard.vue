<script setup lang="ts">
const route = useRoute()
const { user, fetchUser, logout } = useAuth()

onMounted(() => fetchUser())

const nav = [
  { to: '/dashboard', label: 'Resumen', icon: '◉' },
  { to: '/dashboard/courses', label: 'Cursos', icon: '▣' },
  { to: '/dashboard/students', label: 'Estudiantes', icon: '◎' },
]

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="lms-shell lms-shell--dashboard">
    <aside class="lms-sidebar">
      <NuxtLink to="/" class="lms-sidebar__brand">
        <img
          src="/images/branding/logo-layers/emblem-40.png"
          alt="INESA"
          width="48"
          height="48"
          loading="eager"
          decoding="async"
        />
        <div>
          <strong>INESA Academy</strong>
          <span>Panel instructor</span>
        </div>
      </NuxtLink>

      <nav class="lms-sidebar__nav">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="lms-sidebar__link"
          :class="{ active: isActive(item.to) }"
        >
          <span aria-hidden="true">{{ item.icon }}</span>
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="lms-sidebar__footer">
        <p class="lms-sidebar__user">{{ user?.name }}</p>
        <div class="lms-sidebar__actions">
          <NuxtLink to="/academy" class="lms-link">Ver academia</NuxtLink>
          <button type="button" class="lms-link" @click="logout">Salir</button>
        </div>
      </div>
    </aside>

    <div class="lms-main">
      <main class="lms-content">
        <slot />
      </main>
    </div>
  </div>
</template>