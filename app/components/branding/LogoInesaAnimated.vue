<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'emblem' | 'full'
    title?: string
    /** Mark as LCP candidate on above-the-fold hero usage */
    priority?: boolean
  }>(),
  { variant: 'full', title: 'INESA', priority: false },
)

const layers = '/images/branding/logo-layers'

// Emblem is always in the sticky header (above the fold) — keep it eager.
const loading = computed((): 'eager' | 'lazy' =>
  props.priority || props.variant === 'emblem' ? 'eager' : 'lazy',
)
const fetchpriority = computed((): 'high' | 'auto' | 'low' =>
  props.priority ? 'high' : 'auto',
)
const decoding = computed((): 'sync' | 'async' =>
  props.priority ? 'sync' : 'async',
)
</script>

<template>
  <div
    class="logo-hover"
    :class="[`logo-hover--${props.variant}`]"
    role="img"
    :aria-label="title"
  >
    <!-- Compact top-bar emblem: tiny assets instead of full 400KB logo PNG -->
    <div v-if="props.variant === 'emblem'" class="logo-hover__frame">
      <picture>
        <source type="image/webp" :srcset="`${layers}/emblem-40.webp`">
        <img
          :src="`${layers}/emblem-40.png`"
          alt=""
          class="logo-hover__base logo-hover__base--emblem"
          width="40"
          height="40"
          :loading="loading"
          :decoding="decoding"
          :fetchpriority="fetchpriority"
          draggable="false"
        >
      </picture>
    </div>

    <!-- Full brand mark used in hero / marketing blocks -->
    <div v-else class="logo-hover__frame">
      <picture>
        <source type="image/webp" :srcset="`${layers}/logo-closed.webp`">
        <img
          :src="`${layers}/logo-closed.png`"
          alt=""
          class="logo-hover__base"
          width="300"
          height="240"
          :loading="loading"
          :decoding="decoding"
          :fetchpriority="fetchpriority"
          draggable="false"
        >
      </picture>
      <picture class="logo-hover__green">
        <source type="image/webp" :srcset="`${layers}/green-only.webp`">
        <img
          :src="`${layers}/green-only.png`"
          alt=""
          width="300"
          height="240"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          draggable="false"
        >
      </picture>
    </div>
  </div>
</template>

<style scoped>
.logo-hover {
  --close-ms: 0.4s;
  display: inline-block;
  line-height: 0;
}

.logo-hover__frame {
  position: relative;
  width: 100%;
}

.logo-hover__frame :deep(picture),
.logo-hover__frame img {
  display: block;
  height: auto;
  pointer-events: none;
  user-select: none;
  width: 100%;
}

.logo-hover__base {
  position: relative;
  z-index: 1;
}

.logo-hover__base--emblem {
  height: 40px;
  object-fit: contain;
  width: 40px;
}

.logo-hover__green {
  inset: 0;
  opacity: 1;
  position: absolute;
  transition: opacity var(--close-ms) ease;
  z-index: 2;
}

.logo-hover__green :deep(img) {
  height: auto;
  width: 100%;
}

.logo-hover--full {
  max-height: 280px;
  width: min(100%, 300px);
}

.logo-hover--emblem {
  height: 40px;
  width: 40px;
}

.logo-hover--emblem .logo-hover__frame {
  height: 100%;
  overflow: hidden;
}

.logo-hover:hover .logo-hover__green,
.logo-hover:focus-visible .logo-hover__green {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .logo-hover__green {
    transition: none;
  }
}

@media (max-width: 768px) {
  .logo-hover--full {
    max-height: 180px;
  }
}
</style>

<style>
.brand:hover .logo-hover__green,
.brand:focus-visible .logo-hover__green {
  opacity: 0;
}
</style>
