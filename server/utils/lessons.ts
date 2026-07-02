import type { H3Event } from 'h3'
import type Database from 'better-sqlite3'
import { requireUser } from './auth'
import { requireRouteId } from './routeParams'

export async function requireLessonAccess(event: H3Event) {
  const user = await requireUser(event, ['student', 'admin'])
  const lessonId = requireRouteId(event)
  return { user, lessonId }
}

export function requireLesson<T extends Record<string, unknown>>(
  db: Database.Database,
  lessonId: string,
  columns = '*',
): T {
  const lesson = db.prepare(`SELECT ${columns} FROM lessons WHERE id = ?`).get(lessonId) as T | undefined
  if (!lesson) throw createError({ statusCode: 404, statusMessage: 'Lección no encontrada' })
  return lesson
}