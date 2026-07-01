export type CourseStatus = 'draft' | 'coming_soon' | 'published' | 'archived'

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'

export interface CourseModule {
  id: string
  title: string
  description?: string
  order: number
  durationMinutes?: number
  videoUrl?: string
  resourceUrls?: string[]
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  status: CourseStatus
  language: 'es' | 'en' | 'fr'
  modules: CourseModule[]
  thumbnailUrl?: string
  durationHours?: number
  level?: CourseLevel
  tags?: string[]
  publishedAt?: string
}