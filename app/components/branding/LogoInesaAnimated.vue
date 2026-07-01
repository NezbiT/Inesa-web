<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    variant?: 'emblem' | 'full'
    title?: string
  }>(),
  { variant: 'full', title: 'INESA' },
)

const layers = '/images/branding/logo-layers'
</script>

<template>
  <div
    class="logo-hover"
    :class="[`logo-hover--${props.variant}`]"
    role="img"
    :aria-label="title"
  >
    <div class="logo-hover__frame">
      <img
        :src="`${layers}/logo-closed.png`"
        alt=""
        class="logo-hover__base"
        draggable="false"
      />
      <img
        :src="`${layers}/green-only.png`"
        alt=""
        class="logo-hover__green"
        draggable="false"
      />
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

.logo-hover__green {
  inset: 0;
  opacity: 1;
  position: absolute;
  transition: opacity var(--close-ms) ease;
  z-index: 2;
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

.logo-hover--emblem .logo-hover__frame img {
  height: 178%;
  object-fit: cover;
  object-position: top center;
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