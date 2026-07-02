import type { CoursesListResponse } from '#shared/types/api'
import type { DbCourseRow } from '#shared/types/db'
import { getSessionUser } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { mapCourse } from '../../utils/mappers'

export default defineEventHandler(async (event): Promise<CoursesListResponse> => {
  const user = await getSessionUser(event)
  const db = useDb()

  if (!user) {
    const rows = db
      .prepare("SELECT * FROM courses WHERE status = 'published' ORDER BY updated_at DESC")
      .all() as DbCourseRow[]
    return { courses: rows.map(mapCourse) }
  }

  if (user.role === 'admin') {
    const rows = db
      .prepare('SELECT * FROM courses ORDER BY updated_at DESC')
      .all() as DbCourseRow[]
    return { courses: rows.map(mapCourse) }
  }

  const rows = db
    .prepare(
      `SELECT c.* FROM courses c
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.user_id = ? AND c.status = 'published'
       ORDER BY c.updated_at DESC`,
    )
    .all(user.id) as DbCourseRow[]

  return { courses: rows.map(mapCourse) }
})