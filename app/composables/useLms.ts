import type {
  CourseCreateResponse,
  CourseDetailResponse,
  CoursePatchResponse,
  CoursesListResponse,
  DashboardStatsResponse,
  EnrollResponse,
  LessonCreateResponse,
  LessonsGenerateResponse,
  ProgressSaveResponse,
  QuizSubmitResponse,
  StudentActivityResponse,
  StudentCreateResponse,
  StudentsListResponse,
} from '#shared/types/api'
import type { Course, Lesson, LessonType, QuizResult, User } from '#shared/types/lms'

export function useLms() {
  async function getStats(): Promise<DashboardStatsResponse> {
    return $fetch<DashboardStatsResponse>('/api/dashboard/stats')
  }

  async function getCourses(): Promise<Course[]> {
    const res = await $fetch<CoursesListResponse>('/api/courses')
    return res.courses
  }

  async function getCourse(id: string): Promise<CourseDetailResponse> {
    return $fetch<CourseDetailResponse>(`/api/courses/${id}`)
  }

  async function createCourse(form: FormData): Promise<CourseCreateResponse> {
    return $fetch<CourseCreateResponse>('/api/courses', { method: 'POST', body: form })
  }

  async function updateCourse(
    id: string,
    body: Partial<Pick<Course, 'title' | 'description' | 'status'>>,
  ): Promise<CoursePatchResponse> {
    return $fetch<CoursePatchResponse>(`/api/courses/${id}`, { method: 'PATCH', body })
  }

  async function generateLessons(courseId: string): Promise<LessonsGenerateResponse> {
    return $fetch<LessonsGenerateResponse>(`/api/courses/${courseId}/generate`, { method: 'POST' })
  }

  async function addLesson(courseId: string, form: FormData): Promise<LessonCreateResponse> {
    return $fetch<LessonCreateResponse>(`/api/courses/${courseId}/lessons`, {
      method: 'POST',
      body: form,
    })
  }

  async function enroll(courseId: string): Promise<EnrollResponse> {
    return $fetch<EnrollResponse>(`/api/courses/${courseId}/enroll`, { method: 'POST' })
  }

  async function saveProgress(
    lessonId: string,
    data: { progressPercent: number; lastPositionSeconds?: number; completed?: boolean },
  ): Promise<ProgressSaveResponse> {
    return $fetch<ProgressSaveResponse>(`/api/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: data,
    })
  }

  async function getStudents(): Promise<User[]> {
    const res = await $fetch<StudentsListResponse>('/api/students')
    return res.students
  }

  async function createStudent(body: {
    email: string
    name: string
    password: string
  }): Promise<StudentCreateResponse> {
    return $fetch<StudentCreateResponse>('/api/students', { method: 'POST', body })
  }

  async function getActivity(): Promise<StudentActivityResponse['activity']> {
    const res = await $fetch<StudentActivityResponse>('/api/students/activity')
    return res.activity
  }

  async function submitQuiz(lessonId: string, answers: number[]): Promise<QuizResult> {
    return $fetch<QuizSubmitResponse>(`/api/lessons/${lessonId}/quiz`, {
      method: 'POST',
      body: { answers },
    })
  }

  function lessonIcon(type: LessonType): string {
    const icons: Record<LessonType, string> = {
      video: '▶',
      audio: '♫',
      pdf: '📄',
      text: '✎',
      quiz: '?',
    }
    return icons[type]
  }

  return {
    getStats,
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    generateLessons,
    addLesson,
    enroll,
    saveProgress,
    getStudents,
    createStudent,
    getActivity,
    submitQuiz,
    lessonIcon,
  }
}