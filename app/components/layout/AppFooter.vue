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
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img src="/logo-inesa.png" :alt="t('site.title')" class="footer-logo" />
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
        <p>{{ t('contact.location') }}</p>
        <p>
          <a :href="`mailto:${t('contact.email')}`">{{ t('contact.email') }}</a>
        </p>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {{ year }} {{ t('site.title') }}. {{ t('footer.rights') }}</p>
    </div>
  </footer>
</template>