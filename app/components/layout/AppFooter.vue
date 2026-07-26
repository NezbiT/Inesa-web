<script setup lang="ts">
import { computed } from 'vue'

const localePath = useLocalePath()
const { t } = useI18n()
const year = new Date().getFullYear()

const links = computed(() => [
  { label: t('nav.home'), to: '/' },
  { label: t('nav.about'), to: '/about' },
  { label: t('nav.services'), to: '/services' },
  { label: t('nav.courses'), to: '/courses' },
  { label: t('nav.gallery'), to: '/gallery' },
  { label: t('nav.contact'), to: '/contact' },
])

const legalLinks = computed(() => [
  { label: t('footer.privacy'), to: '/privacy' },
  { label: t('footer.terms'), to: '/terms' },
])

const phone = computed(() => t('contact.phone').trim())
const phoneHref = computed(() => t('contact.phoneHref').trim())
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <BrandingLogoInesaAnimated
          variant="full"
          :title="t('site.title')"
          class="footer-logo"
        />
        <p class="footer-title">{{ t('site.title') }}</p>
        <p class="footer-tagline">{{ t('footer.tagline') }}</p>
      </div>
      <nav class="footer-nav" :aria-label="t('footer.navigation')">
        <h3>{{ t('footer.navigation') }}</h3>
        <ul>
          <li v-for="link in links" :key="link.to">
            <NuxtLink :to="localePath(link.to)">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </nav>
      <div class="footer-contact">
        <h3>{{ t('footer.contact') }}</h3>
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
        <LayoutSocialLinks variant="footer" :show-label="true" />
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ year }} {{ t('site.title') }}. {{ t('footer.rights') }}</p>
      <nav class="footer-legal" :aria-label="t('footer.legal')">
        <NuxtLink
          v-for="link in legalLinks"
          :key="link.to"
          :to="localePath(link.to)"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </footer>
</template>
