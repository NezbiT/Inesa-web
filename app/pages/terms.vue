<script setup lang="ts">
const { t } = useI18n()
const sections = useLocaleArray<{ title: string; text: string }>('legal.terms.sections')

useSiteSeo({
  title: `${t('legal.terms.title')} — INESA`,
  description: t('legal.terms.subtitle'),
})
</script>

<template>
  <div class="page-inner">
    <LayoutPageHero
      :title="t('legal.terms.title')"
      :subtitle="t('legal.terms.subtitle')"
    />
    <div class="container page">
      <article class="panel legal-doc">
        <p class="legal-doc__updated">{{ t('legal.terms.updated') }}</p>
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
