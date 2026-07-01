<script setup lang="ts">
defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, default: '◆' },
})
</script>

<template>
  <article class="service-card">
    <span class="service-icon" aria-hidden="true">{{ icon }}</span>
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </article>
</template>