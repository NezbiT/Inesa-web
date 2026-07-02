import type {
  CatalogCourse,
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
import { apiFetch } from '~/utils/apiFetch'

export function useLms() {
  async function getStats(): Promise<DashboardStatsResponse> {
    return apiFetch<DashboardStatsResponse>('/api/dashboard/stats')
  }

  async function getCourses(opts?: { catalog?: boolean }): Promise<CatalogCourse[]> {
    const query = opts?.catalog ? '?catalog=true' : ''
    const res = await apiFetch<CoursesListResponse>(`/api/courses${query}`)
    return res.courses
  }

  async function getCourse(id: string): Promise<CourseDetailResponse> {
    return apiFetch<CourseDetailResponse>(`/api/courses/${id}`)
  }

  async function createCourse(form: FormData): Promise<CourseCreateResponse> {
    return apiFetch<CourseCreateResponse>('/api/courses', {
      method: 'POST',
      body: form,
      timeout: 300_000,
    })
  }

  async function updateCourse(
    id: string,
    body: Partial<Pick<Course, 'title' | 'description' | 'status'>>,
  ): Promise<CoursePatchResponse> {
    return apiFetch<CoursePatchResponse>(`/api/courses/${id}`, { method: 'PATCH', body })
  }

  async function generateLessons(courseId: string): Promise<LessonsGenerateResponse> {
    return apiFetch<LessonsGenerateResponse>(`/api/courses/${courseId}/generate`, {
      method: 'POST',
      timeout: 300_000,
    })
  }

  async function addLesson(courseId: string, form: FormData): Promise<LessonCreateResponse> {
    return apiFetch<LessonCreateResponse>(`/api/courses/${courseId}/lessons`, {
      method: 'POST',
      body: form,
    })
  }

  async function enroll(courseId: string): Promise<EnrollResponse> {
    return apiFetch<EnrollResponse>(`/api/courses/${courseId}/enroll`, { method: 'POST' })
  }

  async function saveProgress(
    lessonId: string,
    data: { progressPercent: number; lastPositionSeconds?: number; completed?: boolean },
  ): Promise<ProgressSaveResponse> {
    return apiFetch<ProgressSaveResponse>(`/api/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: data,
    })
  }

  async function getStudents(): Promise<User[]> {
    const res = await apiFetch<StudentsListResponse>('/api/students')
    return res.students
  }

  async function createStudent(body: {
    email: string
    name: string
    password: string
  }): Promise<StudentCreateResponse> {
    return apiFetch<StudentCreateResponse>('/api/students', { method: 'POST', body })
  }

  async function getActivity(): Promise<StudentActivityResponse['activity']> {
    const res = await apiFetch<StudentActivityResponse>('/api/students/activity')
    return res.activity
  }

  async function submitQuiz(lessonId: string, answers: number[]): Promise<QuizResult> {
    return apiFetch<QuizSubmitResponse>(`/api/lessons/${lessonId}/quiz`, {
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