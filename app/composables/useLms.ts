import type {
  Course,
  DashboardStats,
  Lesson,
  StudentActivity,
  User,
} from '#shared/types/lms'

export function useLms() {
  async function getStats() {
    return $fetch<DashboardStats>('/api/dashboard/stats')
  }

  async function getCourses() {
    const res = await $fetch<{ courses: Course[] }>('/api/courses')
    return res.courses
  }

  async function getCourse(id: string) {
    return $fetch<{
      course: Course
      lessons: Lesson[]
      progress: Array<{
        lesson_id: string
        progress_percent: number
        completed: number
        last_position_seconds: number
      }>
      enrolled: boolean
    }>(`/api/courses/${id}`)
  }

  async function createCourse(form: FormData) {
    return $fetch<{ course: Course }>('/api/courses', { method: 'POST', body: form })
  }

  async function updateCourse(id: string, body: Partial<Pick<Course, 'title' | 'description' | 'status'>>) {
    return $fetch<{ course: Course }>(`/api/courses/${id}`, { method: 'PATCH', body })
  }

  async function generateLessons(courseId: string) {
    return $fetch<{ lessons: Lesson[] }>(`/api/courses/${courseId}/generate`, { method: 'POST' })
  }

  async function addLesson(courseId: string, form: FormData) {
    return $fetch<{ lesson: Lesson }>(`/api/courses/${courseId}/lessons`, { method: 'POST', body: form })
  }

  async function enroll(courseId: string) {
    return $fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' })
  }

  async function saveProgress(
    lessonId: string,
    data: { progressPercent: number; lastPositionSeconds?: number; completed?: boolean },
  ) {
    return $fetch(`/api/lessons/${lessonId}/progress`, { method: 'POST', body: data })
  }

  async function getStudents() {
    const res = await $fetch<{ students: User[] }>('/api/students')
    return res.students
  }

  async function createStudent(body: { email: string; name: string; password: string }) {
    return $fetch('/api/students', { method: 'POST', body })
  }

  async function getActivity() {
    const res = await $fetch<{
      activity: Array<{
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
      }>
    }>('/api/students/activity')
    return res.activity.map(
      (row): StudentActivity & { quizScore?: number | null; quizTotal?: number | null } => ({
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
      }),
    )
  }

  async function submitQuiz(lessonId: string, answers: number[]) {
    return $fetch<import('#shared/types/lms').QuizResult>(`/api/lessons/${lessonId}/quiz`, {
      method: 'POST',
      body: { answers },
    })
  }

  function lessonIcon(type: Lesson['type']) {
    const icons: Record<Lesson['type'], string> = {
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