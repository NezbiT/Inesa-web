import type { CatalogCourse, CoursesListResponse } from '#shared/types/api'
import type { DbCourseRow } from '#shared/types/db'
import { getSessionUser } from '../../utils/auth'
import { tryUseDb } from '../../utils/db'
import { mapCourse } from '../../utils/mappers'

function withEnrollment(
  rows: DbCourseRow[],
  enrolledIds: Set<string>,
): CatalogCourse[] {
  return rows.map((row) => ({
    ...mapCourse(row),
    enrolled: enrolledIds.has(row.id),
  }))
}

export default defineEventHandler(async (event): Promise<CoursesListResponse> => {
  const user = await getSessionUser(event)
  const db = tryUseDb()
  const catalog = getQuery(event).catalog === 'true' || getQuery(event).catalog === '1'

  // Degrade gracefully when SQLite native module is unavailable (e.g. mis-traced deploy).
  if (!db) {
    return { courses: [] }
  }

  if (!user) {
    const rows = db
      .prepare("SELECT * FROM courses WHERE status = 'published' ORDER BY updated_at DESC")
      .all() as DbCourseRow[]
    return { courses: rows.map(mapCourse) }
  }

  if (user.role === 'admin') {
    const rows = catalog
      ? (db
          .prepare("SELECT * FROM courses WHERE status != 'archived' ORDER BY updated_at DESC")
          .all() as DbCourseRow[])
      : (db.prepare('SELECT * FROM courses ORDER BY updated_at DESC').all() as DbCourseRow[])
    return { courses: rows.map(mapCourse) }
  }

  const enrolledRows = db
    .prepare('SELECT course_id FROM enrollments WHERE user_id = ?')
    .all(user.id) as Array<{ course_id: string }>
  const enrolledIds = new Set(enrolledRows.map((r) => r.course_id))

  if (catalog) {
    const rows = db
      .prepare("SELECT * FROM courses WHERE status = 'published' ORDER BY updated_at DESC")
      .all() as DbCourseRow[]
    return { courses: withEnrollment(rows, enrolledIds) }
  }

  const rows = db
    .prepare(
      `SELECT c.* FROM courses c
       JOIN enrollments e ON e.course_id = c.id
       WHERE e.user_id = ? AND c.status = 'published'
       ORDER BY c.updated_at DESC`,
    )
    .all(user.id) as DbCourseRow[]

  return { courses: withEnrollment(rows, enrolledIds) }
})