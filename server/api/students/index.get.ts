import { requireUser } from '../../utils/auth'
import { useDb } from '../../utils/db'

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const rows = useDb()
    .prepare(
      `SELECT id, email, name, role, created_at FROM users WHERE role = 'student' ORDER BY created_at DESC`,
    )
    .all() as Array<{
    id: string
    email: string
    name: string
    role: string
    created_at: string
  }>

  return {
    students: rows.map((row) => ({
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      createdAt: row.created_at,
    })),
  }
})