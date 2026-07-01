import {
  galleryCategories,
  galleryImages,
  galleryImageCount,
} from '#shared/data/gallery'

export { galleryCategories, galleryImages, galleryImageCount }

const previewLayoutClasses = [
  'bento-item--hero',
  '',
  '',
  'bento-item--tall',
  '',
  'bento-item--wide',
]

export function useGallery() {
  const featured = galleryCategories.find((c) => c.id === 'featured')?.images ?? []
  const events = galleryCategories.find((c) => c.id === 'events')?.images ?? []
  const previewImages = [...featured, ...events].slice(0, 6)

  return {
    galleryCategories,
    galleryImages,
    galleryImageCount,
    previewImages,
    previewLayoutClasses,
  }
}