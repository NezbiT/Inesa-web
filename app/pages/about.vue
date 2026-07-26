<script setup lang="ts">
const { t } = useI18n()
const values = useLocaleArray<{ title: string; text: string }>('about.values')
</script>

<template>
  <div class="page-inner">
    <LayoutPageHero :title="t('about.title')" :subtitle="t('about.subtitle')" />

    <div class="container page">
      <div class="about-intro panel">
        <div class="about-intro__image">
          <img
            src="/images/gallery/featured/featured-05.jpg"
            :alt="t('gallery.photoAlt', { n: 9 })"
            loading="lazy"
          >
        </div>
        <div class="about-intro__text">
          <h2>{{ t('about.missionTitle') }}</h2>
          <p>{{ t('about.paragraph1') }}</p>
          <p>{{ t('about.paragraph2') }}</p>
        </div>
      </div>

      <div class="content-grid">
        <section class="panel">
          <h2>{{ t('about.approachTitle') }}</h2>
          <p>{{ t('about.paragraph3') }}</p>
          <p>{{ t('about.paragraph4') }}</p>
        </section>
        <section class="panel panel--image">
          <img
            src="/images/gallery/featured/featured-01.jpg"
            :alt="t('gallery.photoAlt', { n: 1 })"
            loading="lazy"
          >
        </section>
      </div>

      <section class="panel values-panel">
        <h2>{{ t('about.valuesTitle') }}</h2>
        <ul class="values-list">
          <li v-for="(value, index) in values" :key="index">
            <h3>{{ value.title }}</h3>
            <p>{{ value.text }}</p>
          </li>
        </ul>
      </section>
    </div>
  </div>
</template>