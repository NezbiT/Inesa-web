<script setup lang="ts">
import { computed } from 'vue'

const { t } = useI18n()
const localePath = useLocalePath()

useSiteSeo()
useLocalBusinessSchema()

const allServices = useLocaleArray<{ title: string; description: string; icon: string }>('services.items')
const services = computed(() => allServices.value.slice(0, 4))
const homeHighlights = useLocaleArray<{ stat: string; label: string }>('home.highlights')
const phone = computed(() => t('contact.phone').trim())
const phoneHref = computed(() => t('contact.phoneHref').trim())
</script>

<template>
  <div class="page-home">
    <HomeSiteHero />

    <div class="container page">
      <section class="highlights" aria-label="Highlights">
        <article
          v-for="(item, index) in homeHighlights"
          :key="index"
          class="highlight-card"
        >
          <span class="highlight-value">{{ item.stat }}</span>
          <span class="highlight-label">{{ item.label }}</span>
        </article>
      </section>

      <section class="section">
        <div class="section-header">
          <h2>{{ t('services.title') }}</h2>
          <NuxtLink :to="localePath('/services')" class="section-link">
            {{ t('home.servicesLink') }}
          </NuxtLink>
        </div>
        <div class="services-grid">
          <HomeServiceCard
            v-for="(service, index) in services"
            :key="index"
            :title="service.title"
            :description="service.description"
            :icon="service.icon"
          />
        </div>
      </section>

      <section class="about-split panel">
        <div class="about-split__media">
          <UiResponsiveImage
            src="/images/gallery/featured/featured-02.jpg"
            webp-src="/images/gallery/featured/featured-02.webp"
            :alt="t('gallery.photoAlt', { n: 4 })"
            width="800"
            height="600"
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div class="about-split__body">
          <h2>{{ t('about.title') }}</h2>
          <p>{{ t('about.paragraph1') }}</p>
          <p>{{ t('about.paragraph2') }}</p>
          <NuxtLink :to="localePath('/about')" class="btn btn-secondary">
            {{ t('home.aboutLink') }}
          </NuxtLink>
        </div>
      </section>

      <HomeGalleryPreview />

      <section class="contact-strip panel">
        <div>
          <h2>{{ t('home.contactCardTitle') }}</h2>
          <p>
            <a
              :href="`https://maps.google.com/maps?q=${encodeURIComponent(t('contact.mapsQuery'))}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ t('contact.address') }}
            </a>
          </p>
          <p v-if="phone && phoneHref">
            <a :href="`tel:${phoneHref}`">{{ phone }}</a>
          </p>
          <p>
            <a :href="`mailto:${t('contact.email')}`">{{ t('contact.email') }}</a>
          </p>
          <LayoutSocialLinks variant="compact" :show-label="false" />
        </div>
        <div class="contact-strip__cta">
          <h2>{{ t('home.finalCtaTitle') }}</h2>
          <p>{{ t('home.finalCtaText') }}</p>
          <NuxtLink :to="localePath('/contact')" class="btn btn-primary">
            {{ t('home.cta') }}
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>