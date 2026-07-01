<script setup lang="ts">
import { computed } from 'vue'

defineProps({
  compact: { type: Boolean, default: false },
})

const { t, locale, setLocale } = useI18n()

const languages = computed(() => [
  { code: 'en', label: t('lang.en') },
  { code: 'es', label: t('lang.es') },
  { code: 'fr', label: t('lang.fr') },
])

function changeLanguage(code: string) {
  setLocale(code)
}
</script>

<template>
  <div class="language-switcher" :class="{ compact }">
    <span v-if="!compact" class="language-label">{{ t('lang.label') }}</span>
    <div class="language-buttons">
      <button
        v-for="lang in languages"
        :key="lang.code"
        type="button"
        class="lang-btn"
        :class="{ active: locale === lang.code }"
        :aria-pressed="locale === lang.code"
        @click="changeLanguage(lang.code)"
      >
        {{ lang.code.toUpperCase() }}
      </button>
    </div>
  </div>
</template>