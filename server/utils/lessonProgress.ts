import type Database from 'better-sqlite3'
import { nanoid } from 'nanoid'

export interface ProgressUpsert {
  progressPercent: number
  lastPositionSeconds?: number
  completed: boolean
}

export function upsertLessonProgress(
  db: Database.Database,
  userId: string,
  lessonId: string,
  data: ProgressUpsert,
) {
  const now = new Date().toISOString()
  const existing = db
    .prepare('SELECT id FROM lesson_progress WHERE user_id = ? AND lesson_id = ?')
    .get(userId, lessonId) as { id: string } | undefined

  const lastPosition = data.lastPositionSeconds ?? 0

  if (existing) {
    db.prepare(
      `UPDATE lesson_progress
       SET progress_percent = ?, last_position_seconds = ?, completed = ?, updated_at = ?
       WHERE id = ?`,
    ).run(data.progressPercent, lastPosition, data.completed ? 1 : 0, now, existing.id)
  } else {
    db.prepare(
      `INSERT INTO lesson_progress (id, user_id, lesson_id, completed, progress_percent, last_position_seconds, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      nanoid(),
      userId,
      lessonId,
      data.completed ? 1 : 0,
      data.progressPercent,
      lastPosition,
      now,
    )
  }
}