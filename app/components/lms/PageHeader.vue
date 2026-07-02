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
      <p v-if="subtitle">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </header>
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
  margin: 0;
}

.lms-page-header--row {
  align-items: center;
  display: flex;
  justify-content: space-between;
}
</style>