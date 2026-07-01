<script setup lang="ts">
import { reactive, ref } from 'vue'

const { t } = useI18n()

const form = reactive({
  name: '',
  email: '',
  message: '',
})

const status = ref<'success' | 'error' | null>(null)

function submitForm() {
  if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
    status.value = 'error'
    return
  }

  const subject = encodeURIComponent(`INESA~CA — ${form.name}`)
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
            <img src="/logo-inesa.png" :alt="t('site.title')">
          </div>
          <h2>{{ t('contact.infoTitle') }}</h2>
          <ul class="contact-details">
            <li>
              <span class="label">{{ t('contact.nameLabel') }}</span>
              <span>{{ t('contact.name') }}</span>
            </li>
            <li>
              <span class="label">Email</span>
              <a :href="`mailto:${t('contact.email')}`">{{ t('contact.email') }}</a>
            </li>
            <li>
              <span class="label">{{ t('contact.locationLabel') }}</span>
              <a
                href="https://maps.google.com/maps?q=Houston,+TX,+USA"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ t('contact.location') }}
              </a>
            </li>
          </ul>
        </section>

        <section class="panel">
          <h2>{{ t('contact.formTitle') }}</h2>
          <form class="contact-form" @submit.prevent="submitForm">
            <label>
              {{ t('contact.form.name') }}
              <input v-model="form.name" type="text" required>
            </label>
            <label>
              {{ t('contact.form.email') }}
              <input v-model="form.email" type="email" required>
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