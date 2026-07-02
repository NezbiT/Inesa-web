<script setup lang="ts">
import { computed, ref } from 'vue'

const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()
const menuOpen = ref(false)

const navItems = computed(() => [
  { name: 'home', label: t('nav.home'), to: '/' },
  { name: 'about', label: t('nav.about'), to: '/about' },
  { name: 'services', label: t('nav.services'), to: '/services' },
  { name: 'courses', label: t('nav.courses'), to: '/courses' },
  { name: 'academy', label: 'Academy', to: '/academy' },
  { name: 'gallery', label: t('nav.gallery'), to: '/gallery' },
  { name: 'contact', label: t('nav.contact'), to: '/contact' },
])

function isActive(path: string) {
  return route.path === localePath(path)
}

function closeMenu() {
  menuOpen.value = false
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-inner">
      <NuxtLink :to="localePath('/')" class="brand" @click="closeMenu">
        <BrandingLogoInesaAnimated variant="emblem" class="brand-emblem" />
        <div class="brand-text">
          <span class="brand-title">{{ t('site.title') }}</span>
        </div>
      </NuxtLink>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="menuOpen"
        aria-controls="main-nav"
        @click="menuOpen = !menuOpen"
      >
        <span class="menu-toggle__bars" aria-hidden="true" />
        <span class="sr-only">{{ menuOpen ? t('nav.close') : t('nav.menu') }}</span>
      </button>

      <nav id="main-nav" class="main-nav" :class="{ open: menuOpen }">
        <ul>
          <li v-for="item in navItems" :key="item.name">
            <NuxtLink
              :to="localePath(item.to)"
              :class="{ active: isActive(item.to) }"
              @click="closeMenu"
            >
              {{ item.label }}
            </NuxtLink>
          </li>
        </ul>
        <NuxtLink :to="localePath('/academy/login?role=student')" class="nav-academy-cta">
          Estudiantes
        </NuxtLink>
        <LayoutLanguageSwitcher compact />
      </nav>
    </div>
  </header>
</template>