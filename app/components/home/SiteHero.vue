<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()
</script>

<template>
  <section class="site-hero" aria-labelledby="hero-title">
    <div class="site-hero__inner container">
      <div class="site-hero__copy">
        <h1 id="hero-title">{{ t('home.heroTitle') }}</h1>
        <p class="site-hero__lead">{{ t('home.paragraph1') }}</p>
        <div class="site-hero__actions">
          <NuxtLink :to="localePath('/contact')" class="btn btn-primary">{{ t('home.cta') }}</NuxtLink>
          <NuxtLink :to="localePath('/services')" class="btn btn-ghost">{{ t('home.servicesCta') }}</NuxtLink>
        </div>
      </div>

      <div class="site-hero__visual">
        <BrandingLogoInesaAnimated
          variant="full"
          :title="t('site.title')"
          class="site-hero__logo"
        />
      </div>
    </div>
  </section>
</template>