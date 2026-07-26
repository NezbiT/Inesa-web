import type { GalleryCategory } from '#shared/types/gallery'

export const galleryCategories: GalleryCategory[] = [
  {
    id: 'featured',
    images: [
      '/images/gallery/featured/featured-01.jpg',
      '/images/gallery/featured/featured-02.jpg',
      '/images/gallery/featured/featured-05.jpg',
      '/images/gallery/featured/featured-06.jpg',
      '/images/gallery/featured/featured-07.jpg',
    ],
  },
  {
    id: 'analysis',
    images: [
      '/images/gallery/analysis/DSC_2044.JPG',
      '/images/gallery/analysis/DSC_5103.JPG',
      '/images/gallery/analysis/DSC_5104.JPG',
      '/images/gallery/analysis/DSC_5105.JPG',
      '/images/gallery/analysis/DSC_5107.JPG',
      '/images/gallery/analysis/DSC_5109.JPG',
      '/images/gallery/analysis/DSC_5112.JPG',
      '/images/gallery/analysis/DSC_5114.JPG',
      '/images/gallery/analysis/DSC_5115.JPG',
      '/images/gallery/analysis/DSC_5118.JPG',
      '/images/gallery/analysis/DSC_5119.JPG',
      '/images/gallery/analysis/DSC_5121.JPG',
      '/images/gallery/analysis/DSC_5122.JPG',
      '/images/gallery/analysis/DSC_5124.JPG',
      '/images/gallery/analysis/DSC_5126.JPG',
      '/images/gallery/analysis/DSC_5127.JPG',
      '/images/gallery/analysis/DSC_5130.JPG',
      '/images/gallery/analysis/DSC_5132.JPG',
      '/images/gallery/analysis/DSC_5133.JPG',
      '/images/gallery/analysis/DSC_5137.JPG',
      '/images/gallery/analysis/DSC_5138.JPG',
      '/images/gallery/analysis/DSC_5139.JPG',
      '/images/gallery/analysis/DSC_5140.JPG',
      '/images/gallery/analysis/DSC_5144.JPG',
      '/images/gallery/analysis/DSC_5146.JPG',
      '/images/gallery/analysis/DSC_5149.JPG',
      '/images/gallery/analysis/DSC_5150.JPG',
      '/images/gallery/analysis/DSC_5151.JPG',
    ],
  },
  {
    id: 'institutional',
    images: [
      '/images/gallery/institutional/10.jpg',
      '/images/gallery/institutional/FIN 01.jpg',
      '/images/gallery/institutional/curso usfq.jpg',
      '/images/gallery/institutional/prof OMahony.jpg',
    ],
  },
]

export const galleryImages = [...new Set(galleryCategories.flatMap((c) => c.images))]
export const galleryImageCount = galleryImages.length
