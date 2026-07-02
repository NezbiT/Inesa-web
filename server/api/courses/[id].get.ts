import type { CourseDetailResponse } from '#shared/types/api'
import type { DbCourseRow, DbLessonProgressRow, DbLessonRow } from '#shared/types/db'
import { getSessionUser } from '../../utils/auth'
import { sanitizeQuizContent } from '../../utils/courseContent'
import { useDb } from '../../utils/db'
import { mapCourse, mapLesson, mapLessonProgress } from '../../utils/mappers'

export default defineEventHandler(async (event): Promise<CourseDetailResponse> => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })

  const user = await getSessionUser(event)
  const db = useDb()
  const row = db.prepare('SELECT * FROM courses WHERE id = ? OR slug = ?').get(id, id) as
    | DbCourseRow
    | undefined
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })

  const course = mapCourse(row)
  if (course.status !== 'published' && user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Curso no disponible' })
  }

  const isAdmin = user?.role === 'admin'
  const lessons = db
    .prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC')
    .all(course.id)
    .map((lesson) => {
      const mapped = mapLesson(lesson as DbLessonRow)
      if (!isAdmin && mapped.type === 'quiz' && mapped.contentText) {
        return { ...mapped, contentText: sanitizeQuizContent(mapped.contentText) }
      }
      return mapped
    })

  let progress: CourseDetailResponse['progress'] = []
  if (user && (user.role === 'student' || user.role === 'admin')) {
    const rows = db
      .prepare(
        `SELECT lp.* FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         WHERE lp.user_id = ? AND l.course_id = ?`,
      )
      .all(user.id, course.id) as DbLessonProgressRow[]
    progress = rows.map(mapLessonProgress)
  }

  const enrolled =
    user?.role === 'student'
      ? Boolean(
          db
            .prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?')
            .get(user.id, course.id),
        )
      : user?.role === 'admin'

  return { course, lessons, progress, enrolled: Boolean(enrolled) }
})