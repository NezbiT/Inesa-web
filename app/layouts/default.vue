<script setup lang="ts">
import { watch } from 'vue'

const { locale } = useI18n()

watch(locale, (value) => {
  if (import.meta.client) {
    document.documentElement.lang = value
  }
}, { immediate: true })
</script>

<template>
  <div class="app-shell">
    <div class="background-layer" aria-hidden="true" />
    <LayoutAppTopBar />
    <main class="site-main">
      <slot />
    </main>
    <LayoutAppFooter />
  </div>
</template>