import type { StudentsListResponse } from '#shared/types/api'
import type { DbUserRow } from '#shared/types/db'
import { requireUser } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { mapUser } from '../../utils/mappers'

export default defineEventHandler(async (event): Promise<StudentsListResponse> => {
  await requireUser(event, ['admin'])
  const rows = useDb()
    .prepare(
      `SELECT id, email, name, role, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC`,
    )
    .all() as Array<Pick<DbUserRow, 'id' | 'email' | 'name' | 'role' | 'created_at'>>

  return { students: rows.map(mapUser) }
})