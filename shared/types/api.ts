import type {
  Course,
  DashboardStats,
  Lesson,
  LessonProgress,
  QuizResult,
  StudentActivity,
  User,
} from './lms'

export interface AuthLoginResponse {
  user: User
}

export interface CatalogCourse extends Course {
  enrolled?: boolean
}

export interface CoursesListResponse {
  courses: CatalogCourse[]
}

export interface CourseCreateResponse {
  course: Course
  lessonCount: number
}

export interface CourseDetailResponse {
  course: Course
  lessons: Lesson[]
  progress: LessonProgress[]
  enrolled: boolean
}

export interface CoursePatchResponse {
  course: Course
}

export interface LessonsGenerateResponse {
  lessons: Lesson[]
}

export interface LessonCreateResponse {
  lesson: Lesson
}

export interface StudentsListResponse {
  students: User[]
}

export interface StudentCreateResponse {
  id: string
  email: string
  name: string
  createdAt: string
}

export interface StudentActivityResponse {
  activity: StudentActivity[]
}

export interface DashboardStatsResponse extends DashboardStats {}

export interface QuizSubmitResponse extends QuizResult {}

export interface ProgressSaveResponse {
  ok: true
}

export interface EnrollResponse {
  ok: true
}