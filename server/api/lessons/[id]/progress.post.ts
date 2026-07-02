import { z } from 'zod'
import { useDb } from '../../../utils/db'
import { requireLesson, requireLessonAccess } from '../../../utils/lessons'
import { upsertLessonProgress } from '../../../utils/lessonProgress'

const schema = z.object({
  progressPercent: z.number().min(0).max(100),
  lastPositionSeconds: z.number().min(0).default(0),
  completed: z.boolean().default(false),
})

export default defineEventHandler(async (event) => {
  const { user, lessonId } = await requireLessonAccess(event)

  const body = schema.parse(await readBody(event))
  const db = useDb()
  requireLesson(db, lessonId, 'id')

  upsertLessonProgress(db, user.id, lessonId, {
    progressPercent: body.progressPercent,
    lastPositionSeconds: body.lastPositionSeconds,
    completed: body.completed,
  })

  return { ok: true }
})