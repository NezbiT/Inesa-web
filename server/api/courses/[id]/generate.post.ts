import { requireUser } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { generateCourseFromText } from '../../../utils/ai'
import { insertGeneratedCourseContent } from '../../../utils/courseContent'
import type { DbLessonRow } from '#shared/types/db'
import { mapLesson } from '../../../utils/mappers'

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })

  const db = useDb()
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(id) as
    | { id: string; title: string; source_text: string | null }
    | undefined
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })
  if (!course.source_text) {
    throw createError({ statusCode: 400, statusMessage: 'Sube un PDF primero' })
  }

  db.prepare('DELETE FROM lessons WHERE course_id = ?').run(id)
  const generated = await generateCourseFromText(course.title, course.source_text)
  const now = new Date().toISOString()
  insertGeneratedCourseContent(db, id, generated, now)

  const lessons = db
    .prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order ASC')
    .all(id)
    .map((row) => mapLesson(row as DbLessonRow))

  return { lessons }
})