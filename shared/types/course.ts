/** Tipos del catálogo marketing (sitio público). Distintos del LMS en lms.ts */

export type MarketingCourseStatus = 'draft' | 'coming_soon' | 'published' | 'archived'

export type MarketingCourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface MarketingCourseModule {
  id: string
  title: string
  description?: string
  order: number
  durationMinutes?: number
  videoUrl?: string
  resourceUrls?: string[]
}

export interface MarketingCourse {
  id: string
  slug: string
  title: string
  description: string
  status: MarketingCourseStatus
  language: 'es' | 'en' | 'fr'
  modules: MarketingCourseModule[]
  thumbnailUrl?: string
  durationHours?: number
  level?: MarketingCourseLevel
  tags?: string[]
  publishedAt?: string
}