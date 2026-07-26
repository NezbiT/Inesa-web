<script setup lang="ts">
// Global default SEO + LocalBusiness schema for rich results
useSiteSeo()
useLocalBusinessSchema()
</script>

<template>
  <NuxtLayout>
    <NuxtPage :transition="{ name: 'fade', mode: 'out-in' }" />
  </NuxtLayout>
</template>
