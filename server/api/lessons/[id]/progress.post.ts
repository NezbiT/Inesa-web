import { nanoid } from 'nanoid'
import { z } from 'zod'
import { requireUser } from '../../../utils/auth'
import { useDb } from '../../../utils/db'

const schema = z.object({
  progressPercent: z.number().min(0).max(100),
  lastPositionSeconds: z.number().min(0).default(0),
  completed: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const user = await requireUser(event, ['student', 'admin'])
  const lessonId = getRouterParam(event, 'id')
  if (!lessonId) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })

  const body = schema.parse(await readBody(event))
  const db = useDb()
  const lesson = db.prepare('SELECT id FROM lessons WHERE id = ?').get(lessonId)
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Lección no encontrada' })

  const now = new Date().toISOString()
  const existing = db
    .prepare('SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
    .get(user.id, lessonId) as { id: string } | undefined

  if (existing) {
    db.prepare(
      `UPDATE lesson_progress
       SET progress_percent = ?, last_position_seconds = ?, completed = ?, updated_at = ?
       WHERE id = ?`,
    ).run(
      body.progressPercent,
      body.lastPositionSeconds,
      body.completed ? 1 : 0,
      now,
      existing.id,
    )
  } else {
    db.prepare(
      `INSERT INTO lesson_progress (id, user_id, lesson_id, completed, progress_percent, last_position_seconds, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      nanoid(),
      user.id,
      lessonId,
      body.completed ? 1 : 0,
      body.progressPercent,
      body.lastPositionSeconds,
      now,
    )
  }

  return { ok: true }
})