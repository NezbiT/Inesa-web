<script setup lang="ts">
const { t } = useI18n()
const sections = useLocaleArray<{ title: string; text: string }>('legal.privacy.sections')

useSiteSeo({
  title: `${t('legal.privacy.title')} — INESA`,
  description: t('legal.privacy.subtitle'),
})
</script>

<template>
  <div class="page-inner">
    <LayoutPageHero
      :title="t('legal.privacy.title')"
      :subtitle="t('legal.privacy.subtitle')"
    />
    <div class="container page">
      <article class="panel legal-doc">
        <p class="legal-doc__updated">{{ t('legal.privacy.updated') }}</p>
        <section
          v-for="(section, index) in sections"
          :key="index"
          class="legal-doc__section"
        >
          <h2>{{ section.title }}</h2>
          <p>{{ section.text }}</p>
        </section>
      </article>
    </div>
  </div>
</template>
