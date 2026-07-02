import { nanoid } from 'nanoid'
import { writeFile, mkdir } from 'node:fs/promises'
import { join } from 'node:path'
import { z } from 'zod'
import { requireUser } from '../../../utils/auth'
import { useDb } from '../../../utils/db'
import type { DbLessonRow } from '#shared/types/db'
import { mapLesson } from '../../../utils/mappers'

const schema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(['video', 'audio', 'pdf', 'text', 'quiz']),
  contentText: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireUser(event, ['admin'])
  const courseId = getRouterParam(event, 'id')
  if (!courseId) throw createError({ statusCode: 400, statusMessage: 'ID requerido' })

  const form = await readMultipartFormData(event)
  const title = String(form?.find((f) => f.name === 'title')?.data?.toString() || '')
  const description = String(form?.find((f) => f.name === 'description')?.data?.toString() || '')
  const type = String(form?.find((f) => f.name === 'type')?.data?.toString() || 'text') as
    | 'video'
    | 'audio'
    | 'pdf'
    | 'text'
  const contentText = String(form?.find((f) => f.name === 'contentText')?.data?.toString() || '')
  const file = form?.find((f) => f.name === 'file' && f.filename)

  const parsed = schema.parse({
    title,
    description: description || undefined,
    type,
    contentText: contentText || undefined,
  })

  const db = useDb()
  const course = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId)
  if (!course) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' })

  const orderRow = db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM lessons WHERE course_id = ?')
    .get(courseId) as { next_order: number }

  let contentUrl: string | null = null
  if (file?.data) {
    const lessonId = nanoid()
    const uploadDir = join(process.cwd(), 'uploads', 'lessons', lessonId)
    await mkdir(uploadDir, { recursive: true })
    const filename = file.filename || 'file'
    await writeFile(join(uploadDir, filename), file.data)
    contentUrl = `/api/media/lessons/${lessonId}/${filename}`
  }

  const id = nanoid()
  const now = new Date().toISOString()
  db.prepare(
    `INSERT INTO lessons (id, course_id, title, description, type, content_url, content_text, duration_seconds, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
  ).run(
    id,
    courseId,
    parsed.title,
    parsed.description ?? null,
    parsed.type,
    contentUrl,
    parsed.contentText ?? null,
    orderRow.next_order,
    now,
  )

  const row = db.prepare('SELECT * FROM lessons WHERE id = ?').get(id)
  return { lesson: mapLesson(row as DbLessonRow) }
})