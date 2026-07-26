<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

const { t } = useI18n()

useSiteSeo({
  title: `${t('contact.title')} — INESA`,
  description: t('contact.subtitle'),
})
useLocalBusinessSchema()

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const status = ref<'success' | 'error' | null>(null)
const phone = computed(() => t('contact.phone').trim())
const phoneHref = computed(() => t('contact.phoneHref').trim())

function submitForm() {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    status.value = 'error'
    return
  }

  const subject = encodeURIComponent(`INESA — ${form.name}`)
  const body = encodeURIComponent(
    `${form.message}\n\n— ${form.name}\n${form.email}`,
  )
  window.location.href = `mailto:${t('contact.email')}?subject=${subject}&body=${body}`
  status.value = 'success'
}
</script>

<template>
  <div class="page-inner">
    <LayoutPageHero :title="t('contact.title')" :subtitle="t('contact.subtitle')" />

    <div class="container page">
      <div class="contact-layout">
        <section class="panel contact-info">
          <div class="contact-info__logo">
            <BrandingLogoInesaAnimated variant="full" :title="t('site.title')" />
          </div>
          <h2>{{ t('contact.infoTitle') }}</h2>
          <ul class="contact-details">
            <li>
              <span class="label">{{ t('contact.nameLabel') }}</span>
              <span>{{ t('contact.name') }}</span>
            </li>
            <li>
              <span class="label">{{ t('contact.emailLabel') }}</span>
              <a :href="`mailto:${t('contact.email')}`">{{ t('contact.email') }}</a>
            </li>
            <li v-if="phone && phoneHref">
              <span class="label">{{ t('contact.phoneLabel') }}</span>
              <a :href="`tel:${phoneHref}`">{{ phone }}</a>
            </li>
            <li>
              <span class="label">{{ t('contact.addressLabel') }}</span>
              <a
                :href="`https://maps.google.com/maps?q=${encodeURIComponent(t('contact.mapsQuery'))}`"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t('contact.address') }}
              </a>
            </li>
            <li>
              <span class="label">{{ t('contact.locationLabel') }}</span>
              <span>{{ t('contact.location') }}</span>
            </li>
            <li>
              <span class="label">{{ t('social.title') }}</span>
              <LayoutSocialLinks variant="compact" :show-label="false" />
            </li>
          </ul>
        </section>

        <section class="panel">
          <h2>{{ t('contact.formTitle') }}</h2>
          <form class="contact-form" @submit.prevent="submitForm">
            <label>
              {{ t('contact.form.name') }}
              <input v-model="form.name" type="text" required autocomplete="name">
            </label>
            <label>
              {{ t('contact.form.email') }}
              <input v-model="form.email" type="email" required autocomplete="email">
            </label>
            <label>
              {{ t('contact.form.message') }}
              <textarea v-model="form.message" rows="6" required />
            </label>
            <button type="submit" class="btn btn-primary">
              {{ t('contact.form.send') }}
            </button>
            <p v-if="status === 'success'" class="form-status success">
              {{ t('contact.form.success') }}
            </p>
            <p v-if="status === 'error'" class="form-status error">
              {{ t('contact.form.error') }}
            </p>
          </form>
        </section>
      </div>
    </div>
  </div>
</template>
