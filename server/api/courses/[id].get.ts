import { getSessionUser } from '../../utils/auth'
import { sanitizeQuizContent } from '../../utils/courseContent'
import { useDb } from '../../utils/db'
import { mapCourse, mapLesson } from '../../utils/mappers'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })

  const user = await getSessionUser(event)
  const db = useDb()
  const row = db.prepare('SELECT * FROM courses WHERE id = ? OR slug = ?').get(id, id)
  if (!row) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })

  const course = mapCourse(row as Record<string, unknown>)
  if (course.status !== 'published' && user?.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Curso no disponible' })
  }

  const isAdmin = user?.role === 'admin'
  const lessons = db
    .prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC')
    .all(course.id)
    .map((lesson) => {
      const mapped = mapLesson(lesson as Record<string, unknown>)
      if (!isAdmin && mapped.type === 'quiz' && mapped.contentText) {
        return { ...mapped, contentText: sanitizeQuizContent(mapped.contentText) }
      }
      return mapped
    })

  let progress: Array<Record<string, unknown>> = []
  if (user?.role === 'student') {
    progress = db
      .prepare(
        `SELECT lp.* FROM lesson_progress lp
         JOIN lessons l ON l.id = lp.lesson_id
         WHERE lp.user_id = ? AND l.course_id = ?`,
      )
      .all(user.id, course.id) as Array<Record<string, unknown>>
  }

  const enrolled =
    user?.role === 'student'
      ? Boolean(
          db
            .prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?')
            .get(user.id, course.id),
        )
      : true

  return { course, lessons, progress, enrolled }
})