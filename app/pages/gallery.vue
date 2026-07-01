<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="page-inner">
    <LayoutPageHero :title="t('gallery.title')" :subtitle="t('gallery.intro')" />

    <div class="container page">
      <section class="panel gallery-panel">
        <GalleryPhotoGallery />
      </section>
    </div>
  </div>
</template>