<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="lms-page-header" :class="{ 'lms-page-header--row': $slots.actions }">
    <div>
      <h1>{{ title }}</h1>
      <slot />
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </header>
</template>