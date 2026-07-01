export type GalleryCategoryId =
  | 'featured'
  | 'events'
  | 'analysis'
  | 'institutional'

export interface GalleryCategory {
  id: GalleryCategoryId
  images: string[]
}