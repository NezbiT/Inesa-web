import { nanoid } from 'nanoid'
import { requireUser } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import { requireRouteId } from '../../../utils/routeParams'

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ['student', 'admin'])
  const courseId = requireRouteId(event)

  const db = useDb()
  const course = db
    .prepare("SELECT id FROM courses WHERE id = ? AND status = 'published'")
    .get(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Curso no publicado' })

  const exists = db
    .prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?')
    .get(user.id, courseId)
  if (!exists) {
    db.prepare(
      'INSERT INTO enrollments (id, user_id, course_id, enrolled_at) VALUES (?, ?, ?, ?)',
    ).run(nanoid(), user.id, courseId, new Date().toISOString())
  }

  return { ok: true }
})