import type {
  Course,
  CourseStatus,
  Lesson,
  LessonProgress,
  LessonType,
  StudentActivity,
  User,
  UserRole,
} from '#shared/types/lms'
import type {
  DbActivityRow,
  DbCourseRow,
  DbLessonProgressRow,
  DbLessonRow,
  DbUserRow,
} from '#shared/types/db'

function asCourseStatus(value: string): CourseStatus {
  if (value === 'draft' || value === 'published' || value === 'archived') return value
  return 'draft'
}

function asLessonType(value: string): LessonType {
  if (value === 'video' || value === 'audio' || value === 'pdf' || value === 'text' || value === 'quiz') {
    return value
  }
  return 'text'
}

function asUserRole(value: string): UserRole {
  return value === 'admin' ? 'admin' : 'student'
}

export function mapUser(row: Pick<DbUserRow, 'id' | 'email' | 'name' | 'role' | 'created_at'>): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: asUserRole(row.role),
    createdAt: row.created_at,
  }
}

export function mapCourse(row: DbCourseRow): Course {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description || '',
    status: asCourseStatus(row.status),
    thumbnailUrl: row.thumbnail_url,
    sourcePdfPath: row.source_pdf_path,
    sourceText: row.source_text,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapLesson(row: DbLessonRow): Lesson {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    type: asLessonType(row.type),
    contentUrl: row.content_url,
    contentText: row.content_text,
    durationSeconds: row.duration_seconds,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export function mapLessonProgress(row: DbLessonProgressRow): LessonProgress {
  return {
    id: row.id,
    userId: row.user_id,
    lessonId: row.lesson_id,
    completed: Boolean(row.completed),
    progressPercent: row.progress_percent,
    lastPositionSeconds: row.last_position_seconds,
    updatedAt: row.updated_at,
  }
}

export function mapStudentActivity(row: DbActivityRow): StudentActivity {
  return {
    userId: row.user_id,
    userName: row.user_name,
    userEmail: row.user_email,
    courseId: row.course_id,
    courseTitle: row.course_title,
    lessonId: row.lesson_id,
    lessonTitle: row.lesson_title,
    progressPercent: row.progress_percent,
    completed: Boolean(row.completed),
    updatedAt: row.updated_at,
    quizScore: row.quiz_score,
    quizTotal: row.quiz_total,
  }
}