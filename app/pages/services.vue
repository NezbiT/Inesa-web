<script setup lang="ts">
const { t } = useI18n()

const services = useLocaleArray<{ title: string; description: string; icon: string }>('services.items')
const processSteps = useLocaleArray<{ title: string; text: string }>('services.process')
</script>

<template>
  <div class="page-inner">
    <LayoutPageHero :title="t('services.title')" :subtitle="t('services.intro')" />

    <div class="container page">
      <div class="services-grid services-grid-full">
        <HomeServiceCard
          v-for="(service, index) in services"
          :key="index"
          :title="service.title"
          :description="service.description"
          :icon="service.icon"
        />
      </div>

      <section class="panel process-panel">
        <h2>{{ t('services.processTitle') }}</h2>
        <ol class="process-list">
          <li v-for="(step, index) in processSteps" :key="index">
            <span class="step-number">{{ index + 1 }}</span>
            <div>
              <h3>{{ step.title }}</h3>
              <p>{{ step.text }}</p>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </div>
</template>