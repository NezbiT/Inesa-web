<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
const { previewImages, previewLayoutClasses } = useGallery()
</script>

<template>
  <section class="section gallery-preview">
    <div class="section-header">
      <h2>{{ t('home.galleryTitle') }}</h2>
      <NuxtLink :to="localePath('/gallery')" class="section-link">{{ t('home.galleryLink') }}</NuxtLink>
    </div>
    <div class="bento-grid">
      <NuxtLink
        v-for="(src, index) in previewImages"
        :key="src"
        :to="localePath('/gallery')"
        class="bento-item"
        :class="previewLayoutClasses[index]"
      >
        <UiResponsiveImage
          :src="src"
          :webp-src="src.replace(/\.(jpe?g|png)$/i, '.webp')"
          :alt="t('gallery.photoAlt', { n: index + 1 })"
          width="640"
          height="480"
          loading="lazy"
          sizes="(max-width: 768px) 50vw, 33vw"
        />
        <span class="bento-item__shade" aria-hidden="true" />
      </NuxtLink>
    </div>
  </section>
</template>