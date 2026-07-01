export type UserRole = 'admin' | 'student'

export type LessonType = 'video' | 'audio' | 'pdf' | 'text'

export type CourseStatus = 'draft' | 'published' | 'archived'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  createdAt: string
}

export interface Course {
  id: string
  slug: string
  title: string
  description: string
  status: CourseStatus
  thumbnailUrl: string | null
  sourcePdfPath: string | null
  sourceText: string | null
  createdAt: string
  updatedAt: string
}

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string | null
  type: LessonType
  contentUrl: string | null
  contentText: string | null
  durationSeconds: number
  sortOrder: number
  createdAt: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: string
}

export interface LessonProgress {
  id: string
  userId: string
  lessonId: string
  completed: boolean
  progressPercent: number
  lastPositionSeconds: number
  updatedAt: string
}

export interface StudentActivity {
  userId: string
  userName: string
  userEmail: string
  courseId: string
  courseTitle: string
  lessonId: string | null
  lessonTitle: string | null
  progressPercent: number
  completed: boolean
  updatedAt: string
}

export interface DashboardStats {
  courses: number
  students: number
  lessons: number
  completions: number
}