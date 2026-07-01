<script setup lang="ts">
const { user, logout, isAdmin } = useAuth()
</script>

<template>
  <div class="lms-shell lms-shell--learn">
    <header class="lms-learn-header">
      <NuxtLink to="/learn" class="lms-learn-header__brand">
        <img src="/logo-inesa.png" alt="INESA" width="40" height="40" />
        <span>INESA Academy</span>
      </NuxtLink>

      <nav class="lms-learn-header__nav">
        <NuxtLink to="/learn">Mis cursos</NuxtLink>
        <NuxtLink to="/academy">Catálogo</NuxtLink>
        <NuxtLink v-if="isAdmin" to="/dashboard">Dashboard</NuxtLink>
      </nav>

      <div class="lms-learn-header__user">
        <span>{{ user?.name }}</span>
        <button type="button" class="lms-btn lms-btn--ghost" @click="logout">Salir</button>
      </div>
    </header>

    <main class="lms-learn-main">
      <slot />
    </main>
  </div>
</template>