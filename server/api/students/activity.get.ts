import type { StudentActivityResponse } from '#shared/types/api'
import type { DbActivityRow } from '#shared/types/db'
import { requireUser } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { mapStudentActivity } from '../../utils/mappers'

export default defineEventHandler(async (event): Promise<StudentActivityResponse> => {
  await requireUser(event, ['admin'])
  const rows = useDb()
    .prepare(
      `SELECT u.id as user_id, u.name as user_name, u.email as user_email,
              c.id as course_id, c.title as course_title,
              l.id as lesson_id, l.title as lesson_title,
              COALESCE(qa.percent, lp.progress_percent) as progress_percent,
              COALESCE(qa.passed, lp.completed) as completed,
              COALESCE(qa.submitted_at, lp.updated_at) as updated_at,
              qa.score as quiz_score,
              qa.total as quiz_total
       FROM lesson_progress lp
       JOIN users u ON u.id = lp.user_id
       JOIN lessons l ON l.id = lp.lesson_id
       JOIN courses c ON c.id = l.course_id
       LEFT JOIN quiz_attempts qa ON qa.user_id = lp.user_id AND qa.lesson_id = lp.lesson_id
       ORDER BY COALESCE(qa.submitted_at, lp.updated_at) DESC
       LIMIT 100`,
    )
    .all() as DbActivityRow[]

  return { activity: rows.map(mapStudentActivity) }
})