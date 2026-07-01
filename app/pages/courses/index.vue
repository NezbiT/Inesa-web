<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()

const features = useLocaleArray<{ icon: string; title: string; text: string }>('courses.features')
</script>

<template>
  <div class="page-inner page-courses">
    <LayoutPageHero :title="t('courses.title')" :subtitle="t('courses.subtitle')" />

    <div class="container page">
      <section class="courses-hero panel">
        <div class="courses-hero__content">
          <span class="courses-badge">{{ t('courses.badge') }}</span>
          <h2>{{ t('courses.introTitle') }}</h2>
          <p>{{ t('courses.intro') }}</p>
          <p>{{ t('courses.description') }}</p>
        </div>
        <div class="courses-hero__visual" aria-hidden="true">
          <div class="courses-hero__icon">◇</div>
          <p>{{ t('courses.platformLabel') }}</p>
        </div>
      </section>

      <section class="section">
        <div class="section-header">
          <h2>{{ t('courses.featuresTitle') }}</h2>
        </div>
        <div class="courses-features">
          <article
            v-for="(feature, index) in features"
            :key="index"
            class="courses-feature panel"
          >
            <span class="courses-feature__icon">{{ feature.icon }}</span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.text }}</p>
          </article>
        </div>
      </section>

      <section class="courses-cta panel">
        <div class="courses-cta__body">
          <h2>{{ t('courses.ctaTitle') }}</h2>
          <p>{{ t('courses.ctaText') }}</p>
        </div>
        <div class="courses-cta__actions">
          <NuxtLink :to="localePath('/contact')" class="btn btn-primary">
            {{ t('courses.contactCta') }}
          </NuxtLink>
          <a :href="`mailto:${t('contact.email')}`" class="btn btn-secondary">
            {{ t('courses.emailCta') }}
          </a>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.courses-hero {
  align-items: center;
  display: grid;
  gap: 2.4rem;
  grid-template-columns: 1.2fr 0.8fr;
}

.courses-badge {
  background: rgba(233, 79, 29, 0.1);
  border-radius: 999px;
  color: var(--color-brand);
  display: inline-block;
  font-family: var(--font-sans);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-bottom: 1.2rem;
  padding: 0.5rem 1.2rem;
  text-transform: uppercase;
}

.courses-hero__content h2 {
  border-left: 4px solid var(--color-brand);
  color: var(--color-brand);
  font-family: var(--font-sans);
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 1.2rem;
  padding-left: 1rem;
}

.courses-hero__content p {
  margin-bottom: 1rem;
}

.courses-hero__visual {
  align-items: center;
  background: linear-gradient(145deg, rgba(233, 79, 29, 0.08), rgba(133, 170, 12, 0.12));
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  min-height: 220px;
  padding: 2rem;
  text-align: center;
}

.courses-hero__icon {
  color: var(--color-brand);
  font-size: 4.8rem;
  line-height: 1;
}

.courses-hero__visual p {
  color: var(--color-muted);
  font-family: var(--font-sans);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0;
  text-transform: uppercase;
}

.courses-features {
  display: grid;
  gap: 1.4rem;
  grid-template-columns: repeat(3, 1fr);
}

.courses-feature__icon {
  color: var(--color-brand);
  display: block;
  font-size: 2rem;
  margin-bottom: 0.8rem;
}

.courses-feature h3 {
  font-family: var(--font-sans);
  font-size: 1.8rem;
  margin-bottom: 0.8rem;
}

.courses-cta {
  align-items: center;
  display: grid;
  gap: 2rem;
  grid-template-columns: 1fr auto;
}

.courses-cta__body h2 {
  border-left: 4px solid var(--color-brand);
  color: var(--color-brand);
  font-family: var(--font-sans);
  font-size: 2.4rem;
  font-weight: 400;
  line-height: 1.2;
  margin-bottom: 0.8rem;
  padding-left: 1rem;
}

.courses-cta__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 900px) {
  .courses-hero,
  .courses-features,
  .courses-cta {
    grid-template-columns: 1fr;
  }

  .courses-cta__actions {
    justify-content: flex-start;
  }
}
</style>