import { z } from 'zod'
import { requireUser } from '../../utils/auth'
import { useDb } from '../../utils/db'
import { requireRouteId } from '../../utils/routeParams'
import type { DbCourseRow } from '#shared/types/db'
import { mapCourse } from '../../utils/mappers'

const schema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
})

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const id = requireRouteId(event)

  const body = schema.parse(await readBody(event))
  const db = useDb()
  const existing = db.prepare('SELECT * FROM courses WHERE id = ?').get(id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })

  const now = new Date().toISOString()
  db.prepare(
    `UPDATE courses SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      status = COALESCE(?, status),
      updated_at = ?
     WHERE id = ?`,
  ).run(body.title ?? null, body.description ?? null, body.status ?? null, now, id)

  const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(id)
  return { course: mapCourse(row as DbCourseRow) }
})