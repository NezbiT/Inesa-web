<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { galleryCategories, galleryImages } from '#shared/data/gallery'

const { t } = useI18n()

const activeCategory = ref('all')
const activeIndex = ref<number | null>(null)

const categories = computed(() => [
  { id: 'all', label: t('gallery.categories.all') },
  ...galleryCategories.map((category) => ({
    id: category.id,
    label: t(`gallery.categories.${category.id}`),
  })),
])

const photos = computed(() => {
  const source =
    activeCategory.value === 'all'
      ? galleryImages.map((src) => {
          const category =
            galleryCategories.find((entry) => entry.images.includes(src))?.id ?? 'featured'
          return {
            src,
            category,
            featured: category === 'featured',
          }
        })
      : (galleryCategories.find((c) => c.id === activeCategory.value)?.images ?? []).map(
          (src) => ({
            src,
            category: activeCategory.value,
            featured: activeCategory.value === 'featured',
          }),
        )

  return source.map((photo, index) => ({ ...photo, id: index + 1 }))
})

const isOpen = computed(() => activeIndex.value !== null)

function setCategory(id: string) {
  activeCategory.value = id
  activeIndex.value = null
}

function openPhoto(index: number) {
  activeIndex.value = index
}

function closeLightbox() {
  activeIndex.value = null
}

function showPrevious() {
  if (activeIndex.value === null) return
  activeIndex.value =
    (activeIndex.value - 1 + photos.value.length) % photos.value.length
}

function showNext() {
  if (activeIndex.value === null) return
  activeIndex.value = (activeIndex.value + 1) % photos.value.length
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value) return
  if (event.key === 'Escape') closeLightbox()
  if (event.key === 'ArrowLeft') showPrevious()
  if (event.key === 'ArrowRight') showNext()
}

watch(isOpen, (open) => {
  if (import.meta.client) {
    document.body.style.overflow = open ? 'hidden' : ''
  }
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<template>
  <div class="photo-gallery">
    <div class="gallery-toolbar">
      <div class="gallery-filters">
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="filter-btn"
          :class="{ active: activeCategory === category.id }"
          @click="setCategory(category.id)"
        >
          {{ category.label }}
        </button>
      </div>
      <p class="gallery-count">
        {{ t('gallery.count', { count: photos.length }) }}
      </p>
    </div>

    <div class="gallery-masonry">
      <button
        v-for="(photo, index) in photos"
        :key="`${photo.src}-${index}`"
        type="button"
        class="gallery-card"
        :class="{ 'gallery-card--featured': photo.featured }"
        @click="openPhoto(index)"
      >
        <UiResponsiveImage
          :src="photo.src"
          :webp-src="photo.src.replace(/\.(jpe?g|png)$/i, '.webp')"
          :alt="t('gallery.photoAlt', { n: photo.id })"
          width="640"
          height="480"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </button>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen && activeIndex !== null"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="t('gallery.lightbox')"
        @click.self="closeLightbox"
      >
        <button type="button" class="lightbox-close" @click="closeLightbox">
          {{ t('gallery.close') }}
        </button>
        <button type="button" class="lightbox-nav prev" @click="showPrevious">‹</button>
        <figure class="lightbox-content">
          <img
            :src="photos[activeIndex].src"
            :alt="t('gallery.photoAlt', { n: photos[activeIndex].id })"
          />
          <figcaption>
            {{ t('gallery.photoAlt', { n: photos[activeIndex].id }) }}
            ({{ activeIndex + 1 }} / {{ photos.length }})
          </figcaption>
        </figure>
        <button type="button" class="lightbox-nav next" @click="showNext">›</button>
      </div>
    </Teleport>
  </div>
</template>