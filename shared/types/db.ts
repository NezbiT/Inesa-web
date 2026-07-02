import type { CourseStatus, LessonType, UserRole } from './lms'

export interface DbUserRow {
  id: string
  email: string
  name: string
  role: UserRole
  password_hash: string
  created_at: string
}

export interface DbCourseRow {
  id: string
  slug: string
  title: string
  description: string
  status: CourseStatus
  thumbnail_url: string | null
  source_pdf_path: string | null
  source_text: string | null
  created_at: string
  updated_at: string
}

export interface DbLessonRow {
  id: string
  course_id: string
  title: string
  description: string | null
  type: LessonType
  content_url: string | null
  content_text: string | null
  duration_seconds: number
  sort_order: number
  created_at: string
}

export interface DbLessonProgressRow {
  id: string
  user_id: string
  lesson_id: string
  completed: number
  progress_percent: number
  last_position_seconds: number
  updated_at: string
}

export interface DbActivityRow {
  user_id: string
  user_name: string
  user_email: string
  course_id: string
  course_title: string
  lesson_id: string | null
  lesson_title: string | null
  progress_percent: number
  completed: number
  updated_at: string
  quiz_score: number | null
  quiz_total: number | null
}