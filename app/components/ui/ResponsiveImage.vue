<script setup lang="ts">
/**
 * Responsive image with optional WebP source and width/height to reduce CLS.
 * Falls back to the original src when no webpSrc is provided.
 */
const props = withDefaults(
  defineProps<{
    src: string
    webpSrc?: string
    alt: string
    width?: number | string
    height?: number | string
    loading?: 'lazy' | 'eager'
    decoding?: 'async' | 'auto' | 'sync'
    sizes?: string
    srcset?: string
    webpSrcset?: string
    class?: string
    fetchpriority?: 'high' | 'low' | 'auto'
  }>(),
  {
    loading: 'lazy',
    decoding: 'async',
    sizes: '100vw',
  },
)

const imgClass = computed(() => props.class)
</script>

<template>
  <picture>
    <source
      v-if="webpSrc || webpSrcset"
      type="image/webp"
      :srcset="webpSrcset || webpSrc"
      :sizes="sizes"
    >
    <img
      :src="src"
      :srcset="srcset"
      :sizes="srcset ? sizes : undefined"
      :alt="alt"
      :width="width"
      :height="height"
      :loading="loading"
      :decoding="decoding"
      :class="imgClass"
      :fetchpriority="fetchpriority"
    >
  </picture>
</template>
